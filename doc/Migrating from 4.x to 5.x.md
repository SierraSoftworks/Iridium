# Migrating from v4.x to v5.x
There have been some major architectural changes to Iridium between v4.x and v5.x - most significant being the switch
to TypeScript over JavaScript. This serves two primary purposes, the first being that we can finally provide true
IntelliSense support without having to hack around the limitations of individual editors, and the second being that
both Iridium and applications you write which make use of it are far less likely to contain errors as a result of
poor API usage.

Part of this transition required changes to the way certain things are handled by Iridium, those changes are detailed
in the [Architectural Changes](#architectural_changes) section.

## First things first
This isn't a small update (like the one from v2.x to v3.x or v3.x to v4.x) and will **definitely** require changes to your application
if you wish to make use of it. We will be supporting the 3.x branch for a short time, providing bug and security fixes
as necessary, however new features will not be backported.

We recommend that you **do not upgrade existing applications** to the 4.x branch unless you've got a lot of time on your
hands or are using TypeScript already. If however you are set on doing so, you will need to change the following things.

## Architectural Changes