# Hardware content conventions

Keep one maintained source for every hardware fact or attachment. Use the
existing product/accessory directories and English customer-facing Markdown.
Preserve source URLs, document revisions, licensing and the distinction between
specifications, inspection and measured validation. Do not fill unknown fields
with assumed support or certification claims.

A new public page is registered in `../content/hardware-map.json` with its source,
route and document identity. Register downloadable assets and images there as
well; never maintain a second editable copy merely to preserve a URL. Website
generation and styling are implemented in developer.

Training and templates are author material and do not enter product navigation.
Run `npm test` from the mo-docs root and use developer's integrated preview for
page, link, media and mobile/desktop verification.
