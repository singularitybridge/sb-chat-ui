# Embedding the Chat UI

The chat UI can be embedded into any HTML page using an `iframe`. This allows you to integrate the assistant chat functionality directly into your existing websites or applications.

## How to Embed

To embed the chat UI, you need to use the following URL structure for the `iframe`'s `src` attribute:

`http://localhost:5173/embed/assistants/:assistantId?apiKey=YOUR_API_KEY`

Replace `:assistantId` with the actual ID of the assistant you want to display, and `YOUR_API_KEY` with a valid API key.

### Example

Here's a basic HTML example of how to embed the chat UI for an assistant with the ID `your-assistant-id-here` and an API key `your-api-key-here`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Embedded Chat UI</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden; /* Optional: to prevent scrollbars on the parent page */
        }
        iframe {
            width: 100%;
            height: 100%;
            border: none; /* Optional: to remove the default iframe border */
        }
    </style>
</head>
<body>
    <iframe src="http://localhost:5173/embed/assistants/your-assistant-id-here?apiKey=your-api-key-here" title="Chat Assistant"></iframe>
</body>
</html>
```

### API Key

- **Obtaining an API Key**: API keys can be generated from the admin panel of the application. (You may need to specify where exactly if this functionality exists or needs to be built).
- **Security**: The API key is passed as a URL query parameter. While this is straightforward to implement, be aware that URLs can be logged by browsers and servers. For production environments with high security needs, consider alternative methods for transmitting sensitive keys if possible.

### Customization

- **Width and Height**: You can adjust the `width` and `height` attributes of the `iframe` or use CSS to control its dimensions to fit your layout. The example above makes the iframe take the full viewport size.
- **Styling**: The embedded chat UI is designed to be minimal. Further visual customization would need to be done within the chat application's styles itself.

### Important Considerations

- **Assistant ID & API Key**: Ensure you are using a valid and accessible assistant ID and API key in the URL.
- **Application URL**: If your chat application is hosted on a different domain or port, update the `src` URL in the `iframe` accordingly.
- **Security**: 
    - Passing API keys in URLs can expose them in browser history, server logs, and referrer headers. 
    - Ensure that the API key has the minimum necessary permissions for the embedded chat functionality.
    - Consider implementing CORS (Cross-Origin Resource Sharing) policies on your API server to restrict which domains can make requests.
    - For enhanced security, especially in production, you might explore methods like using short-lived tokens obtained via a secure backend call from the parent page, or using the `postMessage` API to send the API key to the iframe after it loads, though these are more complex to implement.

This guide provides the basic steps to embed your chat UI with API key authentication. You can adapt the example to suit your specific integration needs.
