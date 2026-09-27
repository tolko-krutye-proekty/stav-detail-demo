# Изображения для «Без повода»

Созданы встроенным инструментом ImageGen (не CLI и не внешний API-скрипт). Это новые демонстрационные изображения, а не фотографии реального ассортимента.

## Готовые файлы

| Букет | PNG-исходник | Версия для сайта |
| --- | --- | --- |
| Тёплый день | assets/bouquet-warm-cutout.png | assets/bouquet-warm-cutout.webp |
| Тихий разговор | assets/bouquet-light-cutout.png | assets/bouquet-light-cutout.webp |
| Без слов | assets/bouquet-bright-cutout.png | assets/bouquet-bright-cutout.webp |

Все изображения — 1254 × 1254 с настоящим прозрачным альфа-каналом. PNG сохранены без изменения. Версии WebP оптимизированы с quality 90, alphaQuality 100: прозрачность проверена попиксельно и совпадает с оригиналами. Вместо примерно 5,9 МБ PNG браузер использует примерно 1,4 МБ WebP на все три букета. Файлы старой съёмки на синем фоне сохранены, но больше не используются этой страницей.

В CSS `object-fit: contain` помещает весь букет в отведённое место, не обрезая лепестки и стебли. Сам фон страницы виден через прозрачные пиксели. Арки и скругления фотографий отсутствуют.

## Финальные промпты

### Тёплый день

Use case: product-mockup. Asset type: hero cutout for an independent Russian flower atelier website, placed directly over a rich cobalt blue page. Primary request: create a photorealistic, full, hand-tied florist bouquet isolated on a genuinely transparent background (PNG with real alpha, NOT a checkerboard drawing and NOT a white background). Subject: lush but airy coral-peach ranunculus, a few butter-yellow cosmos, tiny lilac sweet peas, delicate natural fresh greenery. Beautiful irregular botanical silhouette, flowers at varying heights, not a rigid round ball. One understated sheet of warm ivory florist paper hugs the lower third, visible gathered green stems and a simple slender ivory cotton ribbon. Whole bouquet upright with a slight natural lean, flower heads spread across the upper two thirds, stems below. Full object in frame, 6 percent transparent breathing room around every outermost petal and stem. Square composition, approximately 1024x1024, bouquet fills most of canvas. Soft side daylight, believable fine petal detail, subtle creases in paper, editorial still-life photography, premium but human rather than glossy synthetic advertising. Constraints: one bouquet only, no vase, no hands, no people, no table, no room, no cast shadow on a background, no text, no logo, no watermark, no borders, no rectangular backdrop, no detached ornamental petals. The surrounding pixels and gaps between flowers must have actual transparency; avoid blue or white edge halos.

### Тихий разговор

Use case: product-mockup. Asset type: isolated florist bouquet for a cobalt-blue independent flower atelier website. Create a photorealistic, complete, upright hand-tied bouquet on a genuinely transparent PNG background with real alpha, including transparent gaps between stems and leaves. A natural asymmetric silhouette, flowers spread at differing heights, gathered stems fully visible. Square framing, full bouquet fills about 88% of canvas, small clear margin all around. Soft warm side daylight, natural fine petals and delicate green foliage, realistic florist paper creases. Elegant editorial still-life, human and organic, not a symmetrical flower ball. One bouquet only. No text, logos, watermark, vase, table, hands, people, ground shadow, extraneous props, rectangular backdrop, white background, checkerboard drawing, or edge halo. Flowers: ivory-white lisianthus and pale butter-yellow tulips, slender natural fresh green foliage and a few unopened buds. Light natural kraft paper wraps only the lower third with a thin cream cotton ribbon. Graceful, understated, quiet. The flower heads must be at different heights, not all identical.

### Без слов

Use case: product-mockup. Asset type: isolated florist bouquet for a cobalt-blue independent flower atelier website. Create a photorealistic, complete, upright hand-tied bouquet on a genuinely transparent PNG background with real alpha, including transparent gaps between stems and leaves. A natural asymmetric silhouette, flowers spread at differing heights, gathered stems fully visible. Square framing, full bouquet fills about 88% of canvas, small clear margin all around. Soft warm side daylight, natural fine petals and delicate green foliage, realistic florist paper creases. Elegant editorial still-life, human and organic, not a symmetrical flower ball. One bouquet only. No text, logos, watermark, vase, table, hands, people, ground shadow, extraneous props, rectangular backdrop, white background, checkerboard drawing, or edge halo. Flowers: rich deep raspberry/burgundy dahlias and coral-peach roses with tiny lilac sweet peas and restrained natural green foliage. Warm ivory paper wraps only the lower third with a thin cream cotton ribbon. A lush but airy asymmetric composition. Deep natural burgundy and coral, not oversaturated neon.

## Проверка

- У всех исходников и WebP есть alpha; сотни тысяч пикселей полностью прозрачны.
- Проверены композиция на синем фоне сайта и изображение на кремовом фоне окна просмотра.
- Витрина, окно «Рассмотреть» и записка используют один и тот же файл выбранного букета.
- PNG не выдаются за реальные фотографии существующего бизнеса.
