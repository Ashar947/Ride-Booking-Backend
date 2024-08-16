const stripe = require('stripe')(process.env.SECRET_KEY);


const createStripeCustomer = async (name, email, phone) => {
    try {
        const customer = await stripe.customer.create({
            name,
            phone,
            email,
            description: "Customer From Node Server",
        })
        return { success: true, customer }
    } catch (error) {
        return { success: false, error }
    }
}

const customerById = async (id) => {
    try {
        const customer = await stripe.customers.retrieve(id);
        return { success: true, customer }
    } catch (error) {
        return { success: false, error }
    }

}

const customerCards = async (customerId) => {
    try {
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card',
        });
        return { success: true, paymentMethods }
    } catch (error) {
        return { success: false, error }
    }
}

const createCardForCustomer = async (customerId) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'setup',
            currency: 'usd',
            customer: customerId,
            success_url: `${process.env.BACKENDURL}success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BACKENDURL}cancel`,
        });
        return { success: true, session }
    } catch (error) {
        return { success: false, error }

    }
}
// will save user card also
const createPaymentIntent = async (customerId, amount) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            customer: customerId,
            setup_future_usage: 'off_session',
            amount: amount * 100,
            currency: 'usd',
        });
        console.log(paymentIntent.client_secret)
        return { success: true, paymentIntent }
    } catch (error) {
        return { success: false, error }
    }
}

// app.get('/success', async (req, res) => {
//     try {
//         const session_id = req.query.session_id;
//         const session = await stripe.checkout.sessions.retrieve(session_id);
//         // return res.status(200).json({ message: "Done",  session, session_id })

//         const setupIntent_id = await session.setup_intent
//         const setupIntent = await stripe.setupIntents.retrieve(setupIntent_id);
//         return res.status(200).json({ payment_method: setupIntent.payment_method, message: "Done", setupIntent, session, session_id })
//     } catch (error) {
//         return res.status(400).json({ error: error.message })
//     }
// })

// app.get('/cancel', async (req, res) => {
//     return res.status(200).send("Cancelled")
// })

const chargeCustomer = async (customer_id, payment_method, email, amount) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            customer: customer_id,
            payment_method: payment_method,
            amount: amount * 100,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
            confirm: true,
            receipt_email: email
        });
        return { success: true, paymentIntent }
    } catch (error) {
        return { success: false, error }
    }
}


module.exports = {
    createStripeCustomer,
    customerById,
    customerCards,
    createCardForCustomer,
    createPaymentIntent,
    chargeCustomer
}