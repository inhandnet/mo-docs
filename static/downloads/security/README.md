# Mo host input firewall

These examples manage only the `inet mo_host_filter` table. They do not replace the system nftables service or filter forwarded container traffic. Review exposed services and existing firewall managers before installation.

See the [Users & security settings guide](https://developer.inhand.com/docs/mo-62a/mo-os/users-and-security/) for installation, rollback and the validation boundary. The stock Debian nftables service stops with a global `flush ruleset`; do not use it to manage this example.

Source: mo-docs. License: CC BY-SA 4.0, as in the repository root.
