export default function template(title, body) {
    return (
        <html>
            <head>
                <title>{ title }</title>
            </head>
            <body>
                { body }
            </body>
        </html>
    );
}