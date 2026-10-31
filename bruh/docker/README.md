# Home Assistant (Bruh Smart Home POC)

Runs Home Assistant in Docker with the community
[ha-resideo](https://github.com/sfcodes/ha-resideo) integration so Bruh's
`/bruh/admin/smart-home` page can control the thermostat. All Docker files
live here; nothing else in the app depends on them.

## Setup
1. `./setup.sh`            – seeds `config/` and installs the Resideo integration
2. `docker compose up -d`  – HA at http://localhost
3. Create your HA owner account in the browser (first run only).
4. Settings → Devices & Services → Add Integration → **Resideo**. Sign in with
   the same login as your Resideo Connect (formerly First Alert) app.
5. Profile (bottom-left) → Security → **Long-lived access tokens** → create one.
6. Open Bruh → Smart Home → Thermostat, enter `http://localhost` and the token.

## HTTPS
Not needed for this POC. HA does not issue certificates itself. Browsers allow
an https page (Vercel) to call `http://localhost`, but not `http://some-lan-name`
(mixed content). For a wall device, serve HA over https with a reverse proxy
(Caddy/Nginx) or Tailscale/Nabu Casa, and add that origin to `cors_allowed_origins`.

## Notes
- Port 80 can be changed in `docker-compose.yml` (`"8123:8123"` avoids privileged ports).
- `configuration.yaml` is only copied once; edit `config/configuration.yaml` afterwards.
