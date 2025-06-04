# Embedding the Chat UI

The chat UI can be embedded into any HTML page using an `iframe`. This allows you to integrate the assistant chat functionality directly into your existing websites or applications.

## How to Embed

To embed the chat UI, you need to use the following URL structure for the `iframe`'s `src` attribute:

`http://localhost:5173/embed/assistants/:assistantId`

Replace `:assistantId` with the actual ID of the assistant you want to display.

### Example

Here's a basic HTML example of how to embed the chat UI for an assistant with the ID `your-assistant-id-here`:

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
    <iframe src="http://localhost:5173/embed/assistants/your-assistant-id-here" title="Chat Assistant"></iframe>
</body>
</html>
```

### Customization

- **Width and Height**: You can adjust the `width` and `height` attributes of the `iframe` or use CSS to control its dimensions to fit your layout. The example above makes the iframe take the full viewport size.
- **Styling**: The embedded chat UI is designed to be minimal. Further visual customization would need to be done within the chat application's styles itself.

### Important Considerations

- **Assistant ID**: Ensure you are using a valid and accessible assistant ID in the URL.
- **Application URL**: If your chat application is hosted on a different domain or port, update the `src` URL in the `iframe` accordingly.
- **Security**: Be mindful of the security implications of embedding content. Ensure that the page hosting the iframe and the chat application itself are secure.

This guide provides the basic steps to embed your chat UI. You can adapt the example to suit your specific integration needs.
