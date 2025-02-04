const message = {
    success: {
        res: 'Success',
        code: 200
    },
    authenticate: {
        res: 'لطفا با نام کاربری خود وارد شوید',
        code: 401
    },
    suspend: {
        res: 'اکانت کاربری شما محدود شده است',
        code: 403
    },
    notFound: {
        res: 'پیدا نشد',
        code: 404
    },
    unknown: {
        res: 'متاسفانه مشکلی رخ داده است، لطفا مجدد تلاش کنید',
        code: 701
    },
    expiredCode: {
        res: 'کد واده شده منقضی یا به اشتباه وارد شده است لطفا مجدد تلاش کنید',
        code: 103
    },
    verificationCodeSend: {
        res: 'کد تایید با موفقیت ارسال شد.',
        code: 601
    },
    invalidCode: {
        res: 'کد ورود اشتباه است',
        code: 602
    },
    userNotFound: {
        res: 'کاربر یافت نشد',
        code: 603
    },
    vpnFinished: {
       
        res:  'متاسفانه سرویس اشتراک ما به اتمام رسیده است، لطفا برای تحویل اشتراک یا بازگشت وجه به پشتیبانی پیام دهید',
        code: 604
    },
    invalidPAYMENT_BATCH_NUM: {
        res: 'کد وارد شده اشتباه است',
        code: 605
    },
    cryptoPaymentFailed: {
        res: 'پرداخت با رمز‌ارز ناموفق بود',
        code: 606
    },
    remainAmount: (remain) => ({
        res: `پرداخت شما موفق بود اما میبایست برای تحویل اشتراک مبلغ ${remain} را پرداخت کنید`,
        code: 607
    }),
    orderProcessed: (payment_id) => ({
        res: `پرداخت با شماره فاکتور ${payment_id} در حال پردازش میباشد`,
        code: 608
    }),
    badRequest: {
        res: 'درخواست شما اشتباه است',
        code: 609
    },
    walletEnough: {
        res: 'موجودی کیف پول بزرگتر از قیمت این اشتراک میباشد و میبایست از طریق کیف پول خرید خود را تکمیل نمایید',
        code: 610
    },
    zarinpalPaymentFailed: {
        res: 'پرداخت با زرین‌پال ناوفق بود، لطفا مجددا تلاش کنید',
        code: 611
    },
    badDecode: {
        res: 'دیکد دیتا سرور اشتباه است',
        code: 612
    },
    badVps: {
        res: 'سرور تعریف نشده است',
        code: 613
    },
    productIsInvalid: {
        res: 'این اشتراک دیگر قابلیت تمدید ندارد، لطفا اشتراک جدید خرید کنید',
        code: 614
    },
    referralCodeInvalid: {
        res: 'کد معرف وارد شده اشتباه است',
        code: 615
    },
    invalidPAYMENT_BATCH_NUM: {
        res: 'شماره یا کد ووچر پرفکت مانی اشتباه است',
        code: 616
    }
}

module.exports = message
