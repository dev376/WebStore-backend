import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// Utility Function
function calcPrices(orderItems) {
    const itemsPrice = orderItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );

    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxRate = 0.15;
    const taxPrice = (itemsPrice * taxRate).toFixed(2);

    const totalPrice = (
        itemsPrice +
        shippingPrice +
        parseFloat(taxPrice)
    ).toFixed(2);

    return {
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice,
        totalPrice,
    };
}

const createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "No order items provided." });
        }

        // ✅ STEP 1: Deduplicate by product ID
        const uniqueItemsMap = new Map();
        for (let item of orderItems) {
            if (uniqueItemsMap.has(item.product)) {
                uniqueItemsMap.get(item.product).qty += item.qty;
            } else {
                uniqueItemsMap.set(item.product, { ...item });
            }
        }

        const deduplicatedItems = Array.from(uniqueItemsMap.values());

        // ✅ STEP 2: Fetch product data from DB
        const productIds = deduplicatedItems.map((item) => item.product);
        const productsFromDB = await Product.find({ _id: { $in: productIds } });

        const dbOrderItems = deduplicatedItems.map((clientItem) => {
            const matchedProduct = productsFromDB.find(
                (p) => p._id.toString() === clientItem.product
            );

            if (!matchedProduct) {
                throw new Error(`Product not found: ${clientItem.product}`);
            }

            // ✅ STEP 3: Check stock availability
            if (matchedProduct.countInStock < clientItem.qty) {
                throw new Error(
                    `Insufficient stock for ${matchedProduct.name}. Available: ${matchedProduct.countInStock}`
                );
            }

            return {
                ...clientItem,
                name: matchedProduct.name,
                image: matchedProduct.image,
                price: matchedProduct.price,
            };
        });

        // ✅ STEP 4: Calculate prices
        const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems);

        // ✅ STEP 5: Create and save order
        const order = new Order({
            orderItems: dbOrderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        // ✅ STEP 6: Decrease countInStock
        for (let item of dbOrderItems) {
            const productToUpdate = await Product.findById(item.product);
            if (productToUpdate) {
                productToUpdate.countInStock -= item.qty;
                await productToUpdate.save();
            }
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "id username");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const countTotalOrders = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        res.json({ totalOrders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const calculateTotalSales = async (req, res) => {
    try {
        const orders = await Order.find();
        const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        res.json({ totalSales });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const calculateTotalSalesByDate = async (req, res) => {
    try {
        const salesByDate = await Order.aggregate([
            {
                $match: {
                    isPaid: true,
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
                    },
                    totalSales: { $sum: "$totalPrice" },
                },
            },
        ]);

        res.json(salesByDate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const findOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "username email"
        );

        if (order) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error("Order not found");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markOrderAsPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.payer.email_address,
            };

            const updateOrder = await order.save();
            res.status(200).json(updateOrder);
        } else {
            res.status(404);
            throw new Error("Order not found");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markOrderAsDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error("Order not found");
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    createOrder,
    getAllOrders,
    getUserOrders,
    countTotalOrders,
    calculateTotalSales,
    calculateTotalSalesByDate,
    findOrderById,
    markOrderAsPaid,
    markOrderAsDelivered,
};
