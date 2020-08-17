# Dragon Badges

This project implements the [OpenBadges standard](https://openbadges.org/) for issuing standard, verifiable badges to anyone with the cryptographically signed and secured backing of the Dragonchain blockchain system.

## What does a badge look like?

The simplest way to understand how badges work is to see one.

Here's a sample badge that could be implemented by Dragonchain to issue to "Golden Jojo" token purchasers (those users who purchased $DRGN tokens during the ICO). Since Dragonchain can cryptographically sign these badge images (which have the user's information embedded inside them), they can trust that anyone who presents (and proves ownership of) a Golden JoJo badge is indeed an authenticatable user.

![Golden Jojo Badge](http://badges.herebedrgns.com/image/4f9b569a-7f82-4e2a-8126-b985cdb57fa4.png)

To see the data embedded in the image, you can go to [https://badgecheck.io](https://badgecheck.io) and upload that image file (after saving to your computer) or enter the URL `http://badges.herebedrgns.com/image/4f9b569a-7f82-4e2a-8126-b985cdb57fa4.png`

The Open Badges 2.0 Validator will then display the validation information for the badge (which includes calling back to the REST API specified in the badge data to verify current validity), and you can see the full verification data by clicking the **Show full verification data** link at the bottom of the page.

## State of the Project

The API and smart contract presented here are functional, though more advanced/correct API authentication should be explored.

A very simple demo web UI for adding and issuing badges is also included but should not be used in a production environment.

Further, the specification can now also be extended to include more Dragonchain-centric features (like using Factor for authentication instead of email address, etc.).
