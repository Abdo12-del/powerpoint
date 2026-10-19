# Map resources: attribution and licences

These notices cover the geographic files in this directory, the Arabic/French wilaya label lookup, and the embedded globe resource used by the Maps toolkit.

## World and Arab-world country boundaries

`world-countries-50m.json` is the `countries-50m.json` file from [`world-atlas@2.0.2`](https://www.npmjs.com/package/world-atlas), a TopoJSON redistribution of Natural Earth 1:50m Admin 0 country boundaries. The Arab-world view filters the same dataset to the 22 Arab League member states; it does not contain a separate copied boundary file. Natural Earth data is in the public domain. The TopoJSON redistribution carries this ISC notice:

> Copyright 2013-2019 Michael Bostock
>
> Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
>
> THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

Natural Earth is a cartographic dataset for presentation-scale maps, not a source for legal or survey boundaries.

## Algeria wilaya boundaries

`algeria-wilayas-69.geojson` is derived from `data/geojson/wilaya-boundaries.geojson` in [`geoalgeria@2.3.0`](https://www.npmjs.com/package/geoalgeria) (source repository: [yasserstudio/geoalgeria](https://github.com/yasserstudio/geoalgeria)). The boundary file contains 69 wilayas and its upstream metadata records OpenStreetMap administrative relations (`admin_level=4`), the source dates, simplification, and corrections. This is display-grade boundary data, not survey-grade data.

**Attribution:** © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

The boundary database is made available under the [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/1-0/). This redistributed/adapted boundary dataset remains under ODbL 1.0. The upstream file is available in the `geoalgeria@2.3.0` npm package at `data/geojson/wilaya-boundaries.geojson`; its detailed provenance is in `data/geojson/wilaya-boundaries.metadata.json`.

## Wilaya name labels

The Arabic and French lookup in `src/components/maps/map-data.ts` is compiled from `data/wilayas.json` in `geoalgeria@2.3.0`. The upstream package licenses its wilaya-name compilation under MIT, separately from the ODbL boundary polygons.

> Copyright (c) 2025-2026 Yasser's Studio (https://yasser.studio)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Globe renderer

`GlobeCanvas` wraps [`cobe@2.0.1`](https://github.com/shuding/cobe), distributed under the MIT License. The upstream README acknowledges its embedded world-map texture as sourced from Wikipedia's “World map blank without borders” file; see the [upstream notice](https://github.com/shuding/cobe#acknowledgment). The app does not download map tiles or separate texture files at runtime.
