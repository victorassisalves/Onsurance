"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Variables for profile creation or system needs
// Onsurance New Production config
exports.admin = (() => {
    const admin = require('firebase-admin');
    const serviceAccount = {
        "type": "service_account",
        "project_id": "onsurance-new",
        "private_key_id": "a94262a9f1edfefd306eb73b8c1e7cf7b30c70e5",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQC4JKWncvFSv8pg\nYgvu42jiW2S22naVe3OrLrNgrR+uyye7nsVtolu3KRdAiZMKOgo107n8tGSVrXqs\nPN/PqN0nfWT8kSlfjcIgeI5QIzSDpkSHgbSI+e4t2YLHN+PXqvQS57irLk5DTOoU\nm69PcKSISYVUOBY9sJa2ePvC2X/vilEi06gLsAmvZiBGCpO17LvKa95pI+wwEZ90\nYkvDlPW2c1+gw1EsClhKX+baKwmJ1G0usMVmIe2i68L+m85IT4oH0fsyAGhzTCb6\nl+o6qGaa5X32XZHas1eulURij/35u4PYX60DBFcUylGOqTYqjmmSDJGd7BkWIXyA\n//M0wuuRAgMBAAECggEAAhJNd8MEAneMXgW0VylhQGyhRypRe7CCFlql43BHIzb/\nWS250FgrenXAoHX7vLl27HCXjsdzuzhSoTXlGaevZzaSqIG0irHkTWu1xCKFQHbi\nHfkgUAspugPQpA+VpVMzwDOxoOFaOYkXuAghUn40p6DWGmKwI10FcQOO53v9Y7Mw\neEFt0xR5Vh3sGI7CbPaLnEfSOXRbmgP2oj+BFX5szKXTLdqxPK1gNlVTkNjgCJ3N\nyhks6fIkzsVcJn2DntUP4JPX3EPFns6qmBA2CRVjE79b2/dgo65VMoIu/suIojoS\nG99nOPeKfmIlHfiUI9LiO92SrkC5JVNuao3A4mG+jQKBgQDzYmTvU7fqx+Woujxm\nM7TSBZmvogaYfJsG1wJUT00TbbZA16IjaPeL9uZMKeWKulH+ZSrGZhSyxddnLzHX\nGQgz2RBBpusby+0mYjllzaIQ4XLoBXBIzTh3yiOmP7JFTGX7otPUpErU0hU2JxBh\nwTogLrDmnx2sW8n87RYaSt3lnQKBgQDBsCXGK8F1xMZysRjAqNvIfp2/kQEB+Ips\ncTpZjJWQIzGtnHeyGrYf2cFX9XqTvAisG75q8tYxFXJ8rRE1TndxZGo+JmzuAR5z\nXSVzDG7iTvSAeSKMqBi8WxD/dOP/E1nBhdcplOOJwJ6JWfyfJQCVLDbugak4BIlq\nkz8zwXvVhQKBgC5B/T0fhE0zQQsYmnIyUaO5PMSM3wQMasqaAu9TQyr2JzWbxk1E\nnggUHSFMtTvwvbTENaUPsc9omtAZwDdJoq14DAbuWrElySUKdi5LLwpWTyiaIAU2\nPA1Idg4a/R7+rkNtZyV7NF3OsAli01JBD3MebLDofRNNPs67oP/OSu5hAoGANCRi\nlu3yn+zAa+HnQv5yZJBJkWfM+KXbRgRZbAAfx3TiC9Xil0z/mKV7ml1YiWsGfqbd\nZVdIeGBIuO2yg0JDf4BD5cVcb9pXQ0FhMo63Ty9oPSnfNjSOrC5r7gme0213LVUF\nrokJlG0JgPp7urAwbvg/NYgscQsvn0RSsHE3EC0CfxdcZhTelPdVowPmo8qo5oLd\nlYUYN1RM0KLwhPFTQslJlhXrAGqN64TccD+jKBDPDk2o65Wld8av4ikfT+egJIr/\neMsadVZIUNHqJrWTb3t7OQBw4kEIKz2DQ+/+9l4ScKscpGOxg6Q9G8dXcLPW2Rf9\neU7ImzFyReD+Wgx+F6k=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-kev0y@onsurance-new.iam.gserviceaccount.com",
        "client_id": "114152998724189346931",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-kev0y%40onsurance-new.iam.gserviceaccount.com"
    };
    const producao = {
        credential: admin.credential.cert(serviceAccount),
        apiKey: "AIzaSyBQZiIRte64L1KfiA1e__7Lo6o07nPu-0c",
        authDomain: "onsurance-new.firebaseapp.com",
        databaseURL: "https://lavo.firebaseio.com/",
        projectId: "onsurance-new",
        storageBucket: "onsurance-new.appspot.com",
        messagingSenderId: "623417231379",
        appId: "1:623417231379:web:b2c9a66e6554b3a8"
    };
    admin.initializeApp(producao);
    // const lavoCustomers = admin.initializeApp({
    //     databaseURL: 'https://lavo.firebaseio.com/'
    // }, 'lavo');
    // const items = admin.initializeApp({
    //     databaseURL: 'https://onsurance-items.firebaseio.com/'
    // }, 'items');
    // const main = {
    //     databaseURL: "https://onsurance-new.firebaseio.com"
    // };
    const enviroments = {
        lavoCustomers: admin.database(),
    };
    return enviroments;
})();
// Onsurance Production config
// export const admin = (() => {
//     try {
//         const admin = require('firebase-admin');
//         const serviceAccount = {
//             "type": "service_account",
//             "project_id": "onsurance-pro",
//             "private_key_id": "6f564014da99983a3c03381d8637391505f1e7aa",
//             "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCxHqjoLfJfS1C9\nvEzTBGKB0j/1rLwFzw+x6N7tID59H4BI5ug6x+XlubJAub2izGSH0A0rdnpKU9lC\nnK3In/XfyC7oflqEMMJAjTy2s5bMNztB8R4IVsOT0LWvRPsaczAyQO0OfQ8j5ngC\nH+o5/F4ZMAtF7tLkr5Wv6pG5jIggG1t+FQhlMSdvMmyyh4FugU2vJUxRBbJGJjHh\ntxCJiBC2gBJEbP6yUB2MUvNk9JIAZjWyincf6taa93VtV9adwV3OL590AjzcyF70\nNn5azOe1S6RwY31IPgZfdjleuWWeYYqQ1MSG/+n20t8QpQUytmHjrexjqTkLTRst\nEEIjxOcFAgMBAAECggEAF/CG7+rV6Z9qaFq9H4BmOBnM303blAVqn6dUCkTjbVIG\nqtPa66b9IdG5kBoK0ahCpkCupwM6gDVZFjHLI2TLfNW30WDSpy9X8hWk8STQ6wVE\nEyOd5Y6knKQHCouOTQLorsIryFuK4lVSPydFJ1U++rSNsYQYKSS6XK6dx7CA7aXK\nxbk7odsyHcEhDlFzQhKkzT30qYoyMTyRoxEVYS6oByab8y8jI8Bas//4B1hMw2Vp\nbU6hqBJ2uFgID4T/TXN4AesVK3Mffsr/NS64YYMyHOTCOkSOaqZ4Gp5xVUIXjeKB\nzbaUSkqIfzNywdTC2pfZ25jbPFOEioynJT8GI6XGOQKBgQD2vwXd00CGB96XJ369\nbHNj9CidV3iCzORuh/o6S1bsN3N0otmDQ79u8U2/UX6QM58urpMyL8bNXh3z9J3J\n9cQtAFhSmT/MQIG3Vt1tSYvlTggE71v+pvqTDsyYGG3+nRjDtYZoMuU7xekkuTKU\nrvmfhqhe1WYIQvlxpqDyGian3wKBgQC3wym3KwfPNlWLdVgjc3ZkRYOJITxjOMl0\nShxPnfeJtg6qLg7+RHFmDiPlFQMYhkFeN1ljJcbHyKXviZLzyfQhrY5/W2pwjhm+\nUz/R//vVJIlqAjEIn56Uon4qRXGzax2qle8a0KQqeHjYEnJcplb1eauXO2l8yekk\n4AVwcccdmwKBgQC7hOTidj+dHLHvUdaiAp+XIOEU4nr1fN1FmxVx4/vFPUcDJxgD\nCCOeHsilUzvKP1EEWywGggSl4pcE5axc5egXAyIcc9bmVUe/m8Zf3frxY2H4ziet\n2hyoUiDunfJKA/3kDjp9SeCoknnirNRh5rBSqjWfDLKkKLIFy0qZc4JZJQKBgQCI\niROXqvs0dNR+uANy47lVq2ieHPm3Z1wXcXEzntVrlr+ypmIxfj0bbOoyrbgNIsOy\n80ERL+JQUr8oCXoMdUNVOpUj/5JIauypw0UqDR7aMTmAcHxqQd8b5NgFJG/ktXPn\naVus+tTfUX/IW3xpZpY58dsSlOw98e+unFyuPXuKfQKBgQDsJ1+IDTWMbinNk86W\nzBX6wnkbB20KuZXugPYaWNqsTW+9ljSZAMm7PShlb95ISDV8batXXi7J34A+7kvr\nHi7xDJB32sxlTGtQXsYJAI7IQ+exOnOT3Jpr3UVLn5XsWK+z2M39D4ThPji3FyV+\n9piOWXkIwRYGDiav27eYJVj26A==\n-----END PRIVATE KEY-----\n",
//             "client_email": "firebase-adminsdk-vfkm6@onsurance-pro.iam.gserviceaccount.com",
//             "client_id": "116584908106751972989",
//             "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//             "token_uri": "https://oauth2.googleapis.com/token",
//             "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//             "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-vfkm6%40onsurance-pro.iam.gserviceaccount.com"
//         };
//         const producao = {
//             credential: admin.credential.cert(serviceAccount),
//             apiKey: "AIzaSyC38FL4LT4Zi-Oi2MvZ9HYf5cIPA12qBkg",
//             authDomain: "onsurance-pro.firebaseapp.com",
//             databaseURL: "https://onsurance-pro.firebaseio.com",
//             projectId: "onsurance-pro",
//             storageBucket: "onsurance-pro.appspot.com",
//             messagingSenderId: "625870736059",
//             appId: "1:625870736059:web:b2144670d0b74234"
//         };
//         admin.initializeApp(producao);
//         const customers = admin.initializeApp({
//             databaseURL: 'https://onsurance-pro-customers.firebaseio.com/'
//         }, 'customers');
//         const items = admin.initializeApp({
//             databaseURL: 'https://onsurance-pro-items.firebaseio.com/'
//         }, 'items');
//         const main = {
//             databaseURL: "https://onsurance-pro.firebaseio.com"
//         };
//         const enviroments = {
//             customers: admin.database(customers),
//             items: admin.database(items),
//             main: admin.database()
//         };
//         console.log("TCL: admin -> enviroments", enviroments);
//         return enviroments
//     } catch (error) {
//         console.log("TCL: admin -> Config Error")
//         console.error(new Error(error));
//     };
// })();
exports.getSecretCustomer = () => {
    const secrets = {
        userSecret: "I use the best Insurance in the World!",
        vehicleSecret: "I am protected by the Bests!",
        indicatorSecret: "I indicated the most awesome company in the World!",
    };
    return secrets;
};
//# sourceMappingURL=admin.js.map