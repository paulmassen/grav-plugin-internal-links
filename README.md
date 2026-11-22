# Internal Links

Internal Links adds a page picker to the CodeMirror Markdown editor in Grav 2. It requires Admin2 2.1.35 or later and the API plugin 1.0.51 or later. These are the versions examined; other versions have not been validated in a live environment.

## Installation

Copy the `internal-links` folder into `user/plugins/`, then reload Admin2. The plugin is enabled by default. The user account must have `api.access` and `api.pages.read` permissions.

## Usage

Select text in the editor, click **Insert an internal link**, and choose a page. Without a selection, the plugin inserts an empty link and places the cursor between the brackets. Search results are paginated, with up to 50 pages per batch; the API configuration may impose a lower limit.

The interface is available in English, French and Spanish. Other languages fall back to English. Reload Admin2 after changing the interface language to update the toolbar button and dialog title.

## Limitations

- The Admin2 modal API does not provide the originating editor or its selection. The plugin identifies the editor using the still-focused toolbar button and the private `__cmView` property. If identification fails, no content is inserted. Changes to Admin2's DOM or focus handling may break this integration. Safari on macOS does not always focus buttons when clicked; use keyboard navigation to focus and activate the button.
- If the document or selection changes while the dialog is open, insertion is refused. Close the dialog and try again. This can happen during collaborative editing.
- On multilingual sites, the picker requires the content language supplied by Admin2. If it is unavailable, loading fails instead of guessing.
- Links use the route returned by the API, the language prefix calculated by Grav, and the API server's installation path. Custom or translated aliases, a multisite pages base, `system.pages.append_url_extension`, or an API server separate from the public site may require manual adjustment. Unpublished or non-routable pages may not be accessible to visitors.
- Compatibility with other Markdown editors or different Admin2 versions is not guaranteed.
