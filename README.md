# Brenton's Flight Deck

A live flight display for Victoria, adaptable between a regular TV or touchscreen
and a fullscreen ceiling installation using an inexpensive vertical projector at
around the A$100–A$150 mark. It combines real aircraft positions around the
viewing area and Melbourne Airport with a current sky map, local weather, and clocks.

This is a Melbourne-focused fork of [cpaczek/skylight](https://github.com/cpaczek/skylight).

## Display options

### Option 1 — TV dashboard (Free)

![Brenton's Flight Deck running as the full interactive TV dashboard](docs/brentons-flight-deck-tv.png)

Use the full 16:9 dashboard on a regular TV, Echo Show 15, or framed touchscreen
at no extra hardware or subscription cost when using a screen and internet
connection you already have. Open it in either of these ways:

- **TV browser:** open the [public Kiosk 1 dashboard](https://skylight-melbourne.vercel.app/?kiosk=1)
  directly in the TV's built-in browser.
- **Screen mirroring:** open the same Kiosk 1 link on a phone, tablet, or computer,
  then mirror or cast that screen to the TV with AirPlay, Google Cast, Miracast,
  or a wired HDMI connection where supported.

Features include a live 70 km runway radar, overhead sky, tap-to-follow aircraft,
current weather, airline logos and the next five flights. Aircraft update about
every three seconds, with Runway and Overhead views alternating every 45 seconds.

Tap **Expand** after opening the dashboard to request fullscreen mode and a screen
wake lock. Kiosk 1 keeps the cursor visible and provides the interactive **Runway**,
**Overhead**, and **Follow** controls.

### Option 2 — Overhead Projector (About A$150)

![Brenton's Overhead running as the minimal ceiling projector view](docs/brentons-overhead-projector.png)

Open the [public Kiosk 2 projector](https://brentons-overhead.vercel.app) for the
separate ceiling presentation. It shows live aircraft with longer trails, stars,
constellations, the Moon, planets, satellites and basic details for the nearest
flight. There are no dashboard panels or visible cursor. It requests a screen
wake lock immediately and enters fullscreen on its first tap.

#### Example vertical projector

[![Kimwood vertical projector showing ceiling-scale projection sizes](docs/kimwood-projector-example.png)](https://www.amazon.com.au/Kimwood-Projector-Bluetooth-Ultra-Projectors/dp/B0G1S78RNM)

[View the Kimwood projector on Amazon Australia](https://www.amazon.com.au/Kimwood-Projector-Bluetooth-Ultra-Projectors/dp/B0G1S78RNM).
The linked model is currently available from A$145.99. It is an example of the
inexpensive rotating-projector style suited to the ceiling setup; availability
and pricing can change.

### Option 3 — Overhead Projector Premium

For a brighter, more permanent ceiling installation, use a Raspberry Pi as the
dedicated player and a Full HD standard-throw projector. The Pi boots directly
into Kiosk 2, so the projector only needs to provide a reliable HDMI image.

#### Suggested equipment

| Part | Suggested choice | Estimated cost (AUD) |
|---|---|---:|
| Player | [Raspberry Pi 4 Model B, 4 GB](https://core-electronics.com.au/raspberry-pi-4-model-b-4gb.html) | $163 |
| Pi essentials | Official power supply, case, 32 GB microSD card and micro-HDMI cable | $50–$80 |
| Vertical projector | [ViewSonic LSD400HD](https://www.viewsonic.com/ap/products/projectors/LSD400HD?app=1) — Full HD laser, 4,000 ANSI lumens, 360-degree projection and 1.48–1.62 standard throw | [$1,499 sale](https://justprojectors.com.au/viewsoniclsd400hd.htm) |
| Blackout curtains | Room-darkening curtains or blinds for stronger daytime contrast | Varies by room |
| Installation | Secure 360-degree-compatible stand or mount and cabling | $100–$250 |
| Optional local ADS-B | RTL-SDR and antenna kit for locally received 1090 MHz aircraft data; a better dedicated antenna can be added for greater range. [How ADS-B works](https://www.casa.gov.au/operations-safety-and-travel/airspace/automatic-dependent-surveillance-broadcast-ads-b/how-ads-b-works) | $105 basic; $145–$205 upgraded |
| Optional airband audio | A second RTL-SDR permits simultaneous ADS-B and 118–137 MHz voice reception, or use a receive-only [XHData D-808](https://www.tecsunradios.com.au/store/product/xhdata-d-808-lw-mw-sw-fm-airband-receiver/) | $105–$185 |
| **Estimated total** | Pi setup with the ViewSonic; excludes curtains, optional radio equipment, installation labour and internet service | **$1,800–$2,000 + curtains** |

The optional radio equipment is receive-only. [ACMA says](https://www.acma.gov.au/apparatus-licences)
a receiver only needs an apparatus licence when an assigned frequency is required.

## Live data

| Information | Source |
|---|---|
| Aircraft positions | [airplanes.live](https://airplanes.live/) public ADS-B feed |
| Current conditions | [Open-Meteo](https://open-meteo.com/) |
| Airline SVG catalog | [Soaring Symbols](https://github.com/soaring-symbols/soaring-symbols) |
| Satellite elements | [CelesTrak](https://celestrak.org/) |
| Sun, moon, stars and planets | [astronomy-engine](https://github.com/cosinekitty/astronomy) |
| Satellite positions | [satellite.js](https://github.com/shashwatak/satellite-js) |
| Melbourne Airport runways | [OurAirports](https://ourairports.com/) |

## License and attribution

The original Skylight project is by [Chris Paczek](https://github.com/cpaczek).<br>
This fork retains the upstream [MIT license](LICENSE).<br>
Airline SVGs are from [Soaring Symbols](https://github.com/soaring-symbols/soaring-symbols) by Anh Thang (MIT); airline trademarks remain with their owners.
