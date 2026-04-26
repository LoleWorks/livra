===  Livra – Delivery Integration ===
Contributors:      livra
Tags:              woocommerce, delivery, routing, livra
Requires at least: 6.0
Tested up to:      6.5
Requires PHP:      7.4
Stable tag:        1.0.0
License:           GPL-2.0+

Trimite comenzile WooCommerce automat către platforma Livra pentru optimizare trasee de livrare.

== Description ==

Plugin-ul conectează magazinul tău WooCommerce cu Livra, platforma de optimizare trasee de livrare din Moldova.

Când o comandă trece în statusul **Processing** (plată primită), comanda este trimisă automat către webhook-ul Livra. Livra o adaugă la lista de livrări pendinte, unde poate fi inclusă în optimizarea de traseu alături de celelalte comenzi ale zilei.

**Ce se trimite:**
- ID comandă
- Nume client
- Telefon (din datele de facturare)
- Adresă de livrare
- Notele comenzii

== Installation ==

1. Încarcă folderul `livra-woocommerce` în `/wp-content/plugins/`
2. Activează plugin-ul din meniul **Plugins** din WordPress
3. Mergi la **WooCommerce → Settings → Livra**
4. Introdu URL-ul webhook-ului Livra și salvează

== Changelog ==

= 1.0.0 =
* Lansare inițială
