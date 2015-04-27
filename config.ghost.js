var path = require('path'),
    config;

config = {
    // ### Production
    // When running Ghost in the wild, use the production environment
    // Configure your URL and mail settings here
    production: {
        url: 'http://localhost:80/blog',

        mail: {
            transport: 'SMTP',
            options: {
                service: 'Mandrill',
                auth: {
                    user: 'user@example.com',
                    pass: 'PaSsWoRd',
                    from: 'Pantry <no-reply@pantryretail.com>'
                }
            }
        },

        database: {
            client: 'mysql',
            connection: {
                host: 'host.com',
                user: 'user',
                password: 'PaSsWoRd',
                database: 'ghost',
                charset  : 'utf8'
            }
        },

        server: {
            host: '127.0.0.1',
            port: '2368'
        }
    },

    // ### Development **(default)**
    development: {
        // The url to use when providing links to the site, E.g. in RSS and email.
        // Change this to your Ghost blogs published URL.
        url: 'http://localhost:9000/blog',

        // Example mail config
        // Visit http://support.ghost.org/mail for instructions
        // ```
        //  mail: {
        //      transport: 'SMTP',
        //      options: {
        //          service: 'Mailgun',
        //          auth: {
        //              user: '', // mailgun username
        //              pass: ''  // mailgun password
        //          }
        //      }
        //  },
        // ```

        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/ghost-dev.db')
            },
            debug: false
        },
        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '127.0.0.1',
            // Port to be passed to node's `net.Server#listen()`, for iisnode set this to `process.env.PORT`
            port: '2368'
        },
        paths: {
            contentPath: path.join(__dirname, '/content/')
        }
    }
};

module.exports = config;
