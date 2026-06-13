// ── Storage keys ──────────────────────────────────────────────────────────────
const DATA_KEY        = 'png_data_v2';
const PLANT_PREFS_KEY = 'png_plant_prefs_v2'; // { "PlantName": { on: true, stage: "Seedling..." } }

// ── Default dataset ───────────────────────────────────────────────────────────
const DEFAULT_DATA = [{"Plant":"🍅 Tomato","Genus":"San Marzano","Soil Used":"Potting","Growth Stage":"Seedling\n(weeks 1–3)","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"2","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"50–80 mg/L","K\n(mg/L)":"100–150 mg/L","Calcium (Ca)":"High – 150–200 ppm\nPrevents blossom-end rot later. Start Cal early.","Magnesium (Mg)":"Moderate – 40–60 ppm\nRequired for chlorophyll from day 1.","Other Nutrients":"Iron (Fe): 2–3 ppm – prevents yellowing between veins\nSulfur (S): 50 ppm – enzyme activity\nBoron (B): 0.5 ppm – cell division","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Use HIGH-N fert at low dose (½ strength). Add Canna CalMag every watering."},{"Plant":"🍅 Tomato","Genus":"San Marzano","Soil Used":"Potting","Growth Stage":"Vegetative\n(weeks 4–7)","N\n(ratio)":"4","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"150–250 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"200–300 mg/L","Calcium (Ca)":"High – 180–220 ppm\nKeep Ca elevated throughout to protect fruit cells.","Magnesium (Mg)":"Moderate – 50–70 ppm\nEpsom salt weekly if leaves pale between veins.","Other Nutrients":"Manganese (Mn): 1–2 ppm\nZinc (Zn): 0.5 ppm – enzyme function\nCopper (Cu): trace","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. Add HIGH-K fert at ½ dose. Canna CalMag every watering."},{"Plant":"🍅 Tomato","Genus":"San Marzano","Soil Used":"Potting","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"60–80 mg/L","K\n(mg/L)":"300–400 mg/L","Calcium (Ca)":"Very High – 200–250 ppm\nCritical — low Ca = blossom-end rot (black bottom on tomatoes).","Magnesium (Mg)":"Moderate – 50–60 ppm\nMaintain steady Mg — deficiency shows as yellowing leaves.","Other Nutrients":"Boron (B): 0.5–1 ppm – essential for pollen & fruit set\nSilica (Si): 50–100 ppm – strengthens cell walls","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert as main feed. Keep HIGH-N very low. Canna CalMag every watering."},{"Plant":"🥔 Potato","Genus":"Unknown","Soil Used":"Coco","Growth Stage":"Vegetative\n(weeks 1–6)","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"200–250 mg/L","Calcium (Ca)":"Moderate – 120–160 ppm\nLess critical than tomatoes but still needed.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Sulfur (S): 50–70 ppm – improves flavour\nIron (Fe): 2 ppm\nMolybdenum (Mo): trace – nitrogen metabolism","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. Mix in HIGH-K fert from week 3. CalMag at half dose."},{"Plant":"🥔 Potato","Genus":"Unknown","Soil Used":"Coco","Growth Stage":"Tuber Bulking\n(weeks 7–12)","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"7","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"300–400 mg/L","Calcium (Ca)":"Moderate – 120–150 ppm","Magnesium (Mg)":"Moderate – 50 ppm\nMg supports starch synthesis in tubers.","Other Nutrients":"Sulfur (S): 60–80 ppm – most important micronutrient for potato quality\nZinc (Zn): 1 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Cut HIGH-N fert to ¼ dose or stop. Go heavy on HIGH-K fert. Continue CalMag."},{"Plant":"🍋 Lemon","Genus":"Lemon Citrus","Soil Used":"Potting","Growth Stage":"Year-round\n(Maintenance)","N\n(ratio)":"4.5","P\n(ratio)":"1","K\n(ratio)":"5.5","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"30–50 mg/L","K\n(mg/L)":"200–250 mg/L","Calcium (Ca)":"High – 160–200 ppm\nCitrus is prone to Ca deficiency — fruit splitting and tip die-back.","Magnesium (Mg)":"High – 60–80 ppm\nMagnesium is critical for lemons — deficiency = yellowing old leaves. Most common problem.","Other Nutrients":"Iron (Fe): 3–5 ppm – citrus very prone to iron chlorosis\nManganese (Mn): 2–3 ppm\nZinc (Zn): 1–2 ppm – fruit size & set\nBoron (B): 0.5 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert as base. Add HIGH-K fert at ½ dose. Canna CalMag at full dose every watering — lemons demand it."},{"Plant":"🍋 Lemon","Genus":"Lemon Citrus","Soil Used":"Potting","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"250–350 mg/L","Calcium (Ca)":"Very High – 180–220 ppm\nPrevents fruit splitting during rapid growth.","Magnesium (Mg)":"High – 70–90 ppm\nMg deficiency peaks during fruiting — watch for yellow leaves.","Other Nutrients":"Boron (B): 0.5–1 ppm – very important for citrus fruit set\nCopper (Cu): 0.5 ppm\nSilica: helps rinds","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert. Add CalMag at full dose. Consider Epsom salt spray on leaves for Mg."},{"Plant":"🍈 Melon","Genus":"Honey Melon","Soil Used":"Unknown","Growth Stage":"Vegetative\n(weeks 1–4)","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"200–250 mg/L","Calcium (Ca)":"High – 160–200 ppm\nStart high Ca early — melons suffer badly from Ca deficiency.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Iron (Fe): 2–3 ppm\nSulfur (S): 40–60 ppm\nManganese (Mn): 1–2 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. CalMag every watering from day 1."},{"Plant":"🍈 Melon","Genus":"Honey Melon","Soil Used":"Unknown","Growth Stage":"Fruiting &\nSwelling","N\n(ratio)":"1","P\n(ratio)":"1","K\n(ratio)":"6.5","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"350–450 mg/L","Calcium (Ca)":"Very High – 200–250 ppm\nCritical — Ca deficiency = internal cracking and bitter taste.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Boron (B): 1 ppm – critical for sugar transport into fruit\nSilica: 50–100 ppm\nCopper (Cu): trace","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Go maximum HIGH-K fert. Barely use HIGH-N. Full dose CalMag every watering. This stage decides the sweetness."},{"Plant":"🌶️ Red Chili","Genus":"Unknown","Soil Used":"Unknown","Growth Stage":"Vegetative\n(weeks 1–5)","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"150–200 mg/L","Calcium (Ca)":"Moderate – 130–160 ppm\nBlossom-end rot possible in peppers too — keep Ca up.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 2 ppm\nZinc (Zn): 0.5–1 ppm – affects capsaicin production\nBoron (B): 0.3 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. CalMag every watering."},{"Plant":"🌶️ Red Chili","Genus":"Unknown","Soil Used":"Unknown","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"5.5","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"280–380 mg/L","Calcium (Ca)":"High – 160–200 ppm\nBlossom-end rot is common in peppers — maintain Ca.","Magnesium (Mg)":"Moderate – 50 ppm","Other Nutrients":"Zinc (Zn): 1–2 ppm – boosts capsaicin levels\nBoron (B): 0.5 ppm – fruit set\nSulfur (S): 50 ppm – flavour compounds","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert as main feed. Minimal HIGH-N. CalMag every watering."},{"Plant":"🫑 Bell Pepper","Genus":"Unknown","Soil Used":"Unknown","Growth Stage":"Vegetative\n(weeks 1–5)","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"150–200 mg/L","Calcium (Ca)":"High – 150–180 ppm\nBell peppers are very sensitive to Ca deficiency — causes blossom-end rot.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 2 ppm\nBoron (B): 0.3–0.5 ppm\nMolybdenum (Mo): trace","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. CalMag at full dose — bell peppers need more Ca than chilies."},{"Plant":"🫑 Bell Pepper","Genus":"Unknown","Soil Used":"Unknown","Growth Stage":"Fruiting &\nColour Development","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"5.5","N\n(mg/L)":"80–100 mg/L","P\n(mg/L)":"50–60 mg/L","K\n(mg/L)":"280–350 mg/L","Calcium (Ca)":"Very High – 180–220 ppm\nEssential to prevent blossom-end rot throughout fruiting.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Boron (B): 0.5 ppm – critical for fruit set and skin quality\nSilica: 50 ppm – thicker fruit walls","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch fully to HIGH-K fert. Drop HIGH-N to ¼ dose. Full CalMag every watering."},{"Plant":"🌿 Thyme","Genus":"Unknown","Soil Used":"Unknown","Growth Stage":"Year-round\n(Herb)","N\n(ratio)":"2.5","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"50–100 mg/L","P\n(mg/L)":"20–40 mg/L","K\n(mg/L)":"100–150 mg/L","Calcium (Ca)":"Moderate – 100–140 ppm","Magnesium (Mg)":"Low-Moderate – 30–50 ppm","Other Nutrients":"Iron (Fe): 1–2 ppm\nSulfur (S): 30–50 ppm – critical for thymol (active aroma compound)\nManganese (Mn): 1 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Use HIGH-N at ¼ dose only. HIGH-K at ½ dose for better aroma. CalMag at ½ dose."},{"Plant":"🫐 Blackberry","Genus":"Asterina","Soil Used":"Potting","Growth Stage":"Vegetative /\nCane Growth","N\n(ratio)":"2.5","P\n(ratio)":"1","K\n(ratio)":"3.5","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"150–200 mg/L","Calcium (Ca)":"High – 160–200 ppm\nBerries are very prone to Ca deficiency — causes poor fruit firmness.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Iron (Fe): 2–3 ppm – berries are prone to iron deficiency\nManganese (Mn): 1–2 ppm\nBoron (B): 0.3 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at moderate dose. CalMag at full dose — blackberries need it in coco."},{"Plant":"🫐 Blackberry","Genus":"Asterina","Soil Used":"Potting","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"250–320 mg/L","Calcium (Ca)":"Very High – 180–220 ppm\nCa directly affects berry firmness and shelf life.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Boron (B): 0.5 ppm – fruit set essential for berries\nSilica: 50 ppm\nSulfur (S): 40 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert. Minimal HIGH-N. Full CalMag every watering for firm berries."},{"Plant":"🍓 Strawberry","Genus":"Frageria","Soil Used":"Potting","Growth Stage":"Vegetative /\nRunner Stage","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"150–200 mg/L","Calcium (Ca)":"High – 150–200 ppm\nPrevents tip burn on leaves — a common Ca deficiency symptom.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 2 ppm – strawberries are prone to chlorosis\nBoron (B): 0.3–0.5 ppm\nMolybdenum (Mo): trace","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N at moderate dose. CalMag at full dose. Add HIGH-K at ¼ dose."},{"Plant":"🍓 Strawberry","Genus":"Frageria","Soil Used":"Potting","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"280–350 mg/L","Calcium (Ca)":"Very High – 180–220 ppm\nTip burn and poor fruit texture without Ca. Common problem.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Boron (B): 0.5–1 ppm – key for fruit set and seed development\nSilica: 50 ppm – stronger plant","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert as main feed. Drop HIGH-N to trace. Full CalMag every watering."},{"Plant":"🍏 Apple","Genus":"Golden Delicious","Soil Used":"Potting","Growth Stage":"Spring\nVegetative Growth","N\n(ratio)":"3.5","P\n(ratio)":"1","K\n(ratio)":"3.5","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"150–200 mg/L","Calcium (Ca)":"High – 160–200 ppm\nCa is critical for fruit cell development — deficiency later causes bitter pit. Start Ca early.","Magnesium (Mg)":"Moderate – 50–70 ppm\nMg supports chlorophyll production for the new leaf flush.","Other Nutrients":"Boron (B): 0.5–1 ppm – very important for apple fruit set and pollen\nZinc (Zn): 1–2 ppm – shoot growth\nManganese (Mn): 1–2 ppm\nIron (Fe): 2–3 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose from bud break. CalMag at full dose. Add HIGH-K at ½ dose."},{"Plant":"🍏 Apple","Genus":"Golden Delicious","Soil Used":"Potting","Growth Stage":"Flowering &\nFruit Set","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"60–80 mg/L","K\n(mg/L)":"200–250 mg/L","Calcium (Ca)":"Very High – 200–250 ppm\nCritical stage for Ca — fruit cells are dividing. Low Ca = bitter pit at harvest.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Boron (B): 1 ppm – ESSENTIAL for apple pollination and fruit set.\nZinc (Zn): 1 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Drop HIGH-N to ½ dose. Increase HIGH-K. Full CalMag every watering. Consider foliar boron spray."},{"Plant":"🍏 Apple","Genus":"Golden Delicious","Soil Used":"Potting","Growth Stage":"Fruit Swelling\n& Ripening","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"8","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"30–50 mg/L","K\n(mg/L)":"280–380 mg/L","Calcium (Ca)":"Very High – 200–250 ppm\nContinue high Ca to prevent bitter pit — the most common quality problem in Golden Delicious.","Magnesium (Mg)":"Moderate – 50 ppm","Other Nutrients":"Sulfur (S): 50 ppm – flavour development\nBoron (B): 0.5 ppm\nCalcium (Ca) foliar spray recommended for Golden Delicious specifically","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K as main feed. Minimal HIGH-N. Full CalMag every watering until 1 week before harvest."},{"Plant":"🦍 Gorilla Glue Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Seedling\n(weeks 1–2)","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"2","N\n(mg/L)":"25–50 mg/L","P\n(mg/L)":"15–25 mg/L","K\n(mg/L)":"25–50 mg/L","Calcium (Ca)":"Low-Moderate – 80–120 ppm\nIn coco start CalMag gently from day 1 — coco locks Ca/Mg regardless of plant size.","Magnesium (Mg)":"Low – 20–40 ppm","Other Nutrients":"Iron (Fe): 1 ppm\nZinc (Zn): trace — very sensitive at this stage, less is more","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Do NOT feed yet. CalMag at ¼ dose in pH'd water only. Plain water is safer than overfeeding at this stage."},{"Plant":"🦍 Gorilla Glue Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Vegetative\n(weeks 3–5)","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"2","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"50–75 mg/L","K\n(mg/L)":"100–150 mg/L","Calcium (Ca)":"High – 150–200 ppm\nCalMag demand rises fast as plant grows — double the seedling dose now.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Iron (Fe): 2 ppm\nManganese (Mn): 1 ppm\nSilica (Si): 50–100 ppm – builds strong stems for heavy buds","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at ½ then full dose. CalMag every watering at full dose. Add small amount HIGH-K."},{"Plant":"🦍 Gorilla Glue Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Pre-Flower\n(weeks 4–5)","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"100–130 mg/L","P\n(mg/L)":"60–80 mg/L","K\n(mg/L)":"180–250 mg/L","Calcium (Ca)":"High – 160–200 ppm\nKeep CalMag high — autos in coco are very prone to Ca deficiency during rapid growth.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Silica (Si): 100 ppm – critical for supporting the weight of Gorilla Glue's famously dense buds\nBoron (B): 0.3 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Transition: reduce HIGH-N to ½ dose, increase HIGH-K to full dose. Full CalMag every watering."},{"Plant":"🦍 Gorilla Glue Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Full Flower &\nBud Swelling\n(weeks 6–9)","N\n(ratio)":"1","P\n(ratio)":"1.5","K\n(ratio)":"5","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"80–100 mg/L","K\n(mg/L)":"280–380 mg/L","Calcium (Ca)":"High – 160–200 ppm\nCalMag every watering — deficiency shows as brown leaf edges or purple stems.","Magnesium (Mg)":"Moderate – 50 ppm","Other Nutrients":"Silica (Si): 100 ppm – continues to support heavy bud weight\nBoron (B): 0.5 ppm\nZinc (Zn): 1 ppm – terpene synthesis","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-K fert as main feed at full dose. HIGH-N at ¼ dose only. Full CalMag. This strain eats nutrients — don't underfeed."},{"Plant":"🦍 Gorilla Glue Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Flush\n(final 1–2 weeks)","N\n(ratio)":"—","P\n(ratio)":"—","K\n(ratio)":"—","N\n(mg/L)":"—","P\n(mg/L)":"—","K\n(mg/L)":"—","Calcium (Ca)":"Zero – stop all nutrients","Magnesium (Mg)":"Zero","Other Nutrients":"No nutrients at all — flush with plain pH'd water (5.8–6.2) to clear salt buildup from coco and improve final flavour.","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Stop all fertilizers. Plain pH'd water only. Coco flushes faster than soil — 3–5 days of plain water is sufficient."},{"Plant":"🍈 Guava Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Seedling\n(weeks 1–2)","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"2","N\n(mg/L)":"25–50 mg/L","P\n(mg/L)":"15–25 mg/L","K\n(mg/L)":"25–50 mg/L","Calcium (Ca)":"Low – 80–100 ppm\nCalMag in coco from day 1 even at this stage — very dilute.","Magnesium (Mg)":"Low – 20–30 ppm","Other Nutrients":"Keep micronutrients minimal — seedling roots can't handle much. Iron trace only.","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"CalMag at ¼ dose only. No other nutrients until 2–3 true leaves appear. Plain pH'd water preferred."},{"Plant":"🍈 Guava Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Vegetative\n(weeks 3–5)","N\n(ratio)":"2.5","P\n(ratio)":"1","K\n(ratio)":"2.5","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"100–150 mg/L","Calcium (Ca)":"High – 150–200 ppm\nCa demand increases rapidly — full CalMag dose from week 3.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 1–2 ppm\nSilica (Si): 50 ppm – good for compact structure\nManganese (Mn): 1 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N at ½ dose. CalMag every watering at full dose. Minimal HIGH-K for now."},{"Plant":"🍈 Guava Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Flowering\n(weeks 5–8)","N\n(ratio)":"1","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"60–100 mg/L","P\n(mg/L)":"70–90 mg/L","K\n(mg/L)":"250–350 mg/L","Calcium (Ca)":"High – 160–200 ppm\nMaintain CalMag throughout — deficiency shows as brown tips.","Magnesium (Mg)":"Moderate – 50 ppm","Other Nutrients":"Boron (B): 0.5 ppm – fruit set and resin\nZinc (Zn): 1 ppm – terpene synthesis\nSilica (Si): 100 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K as main feed. Cut HIGH-N to ¼ dose. Full CalMag every watering."},{"Plant":"🍈 Guava Auto","Genus":"(Fast Buds)","Soil Used":"Coco","Growth Stage":"Flush\n(final 1 week)","N\n(ratio)":"—","P\n(ratio)":"—","K\n(ratio)":"—","N\n(mg/L)":"—","P\n(mg/L)":"—","K\n(mg/L)":"—","Calcium (Ca)":"Zero – stop all nutrients","Magnesium (Mg)":"Zero","Other Nutrients":"No nutrients — coco flushes fast. 5–7 days of plain pH'd water is enough to clear salts and maximise flavour.","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Stop everything. Plain water pH 5.8–6.2 only. Guava Auto's tropical terpenes really shine after a proper flush."},{"Plant":"🌿 Coriander","Genus":"Coriandrum Sativum","Soil Used":"Unknown","Growth Stage":"Year-round\n(Herb)","N\n(ratio)":"2.5","P\n(ratio)":"1","K\n(ratio)":"3.5","N\n(mg/L)":"50–100 mg/L","P\n(mg/L)":"20–40 mg/L","K\n(mg/L)":"80–120 mg/L","Calcium (Ca)":"Moderate – 100–140 ppm","Magnesium (Mg)":"Low – 30–50 ppm","Other Nutrients":"Iron (Fe): 1 ppm\nSulfur (S): 30–50 ppm — essential for coriander's distinctive aroma compounds","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Bio Grow ¼ dose (1ml/L). Avoid overfeeding — bolts fast under stress."},{"Plant":"🌿 Mint","Genus":"Unknown","Soil Used":"Coco","Growth Stage":"Year-round\n(Herb)","N\n(ratio)":"3.5","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"20–40 mg/L","K\n(mg/L)":"100–150 mg/L","Calcium (Ca)":"Moderate – 100–140 ppm","Magnesium (Mg)":"Moderate – 30–50 ppm","Other Nutrients":"Iron (Fe): 1–2 ppm\nMagnesium (Mg): important for leaf colour\nSulfur (S): 30–40 ppm — menthol synthesis","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Bio Grow ¼–½ dose (1–2ml/L). Lemon fert 1ml/L for K+S."},{"Plant":"🌶️ Yellow Chilli Hot","Genus":"Capsicum chinense","Soil Used":"Potting","Growth Stage":"Vegetative\n(weeks 1–5)","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"150–200 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"150–200 mg/L","Calcium (Ca)":"Moderate – 130–160 ppm\nStart Ca early — blossom-end rot is common in C. chinense.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 2 ppm\nZinc (Zn): 0.5–1 ppm – critical for capsaicin synthesis\nBoron (B): 0.3 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. CalMag every watering from day 1."},{"Plant":"🌶️ Yellow Chilli Hot","Genus":"Capsicum chinense","Soil Used":"Potting","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"5.5","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"50–70 mg/L","K\n(mg/L)":"280–380 mg/L","Calcium (Ca)":"High – 160–200 ppm\nBlossom-end rot is common in C. chinense — maintain Ca consistently.","Magnesium (Mg)":"Moderate – 50 ppm","Other Nutrients":"Zinc (Zn): 1–2 ppm – directly boosts capsaicin levels\nBoron (B): 0.5 ppm – fruit set\nSulfur (S): 50 ppm – flavour compounds and heat","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert as main feed. Minimal HIGH-N. CalMag every watering.\n💡 Slight drought stress during fruiting intensifies heat (capsaicin) — let coco get drier than usual."},{"Plant":"🫐 Blueberry","Genus":"Vaccinium corymbosum – Sunshine Blue","Soil Used":"Acidic","Growth Stage":"Vegetative /\nEstablishment","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"2.5","N\n(mg/L)":"80–120 mg/L","P\n(mg/L)":"30–50 mg/L","K\n(mg/L)":"100–150 mg/L","Calcium (Ca)":"Low – 80–120 ppm\nBlueberries do NOT need high Ca — at their required acidic pH, Ca is less critical.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 3–5 ppm – blueberries are very prone to iron chlorosis above pH 5.5\nManganese (Mn): 2–3 ppm\nZinc (Zn): 1 ppm\nSulfur (S): 50–80 ppm – helps maintain soil acidity","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"⚠️ SPECIAL: Use acid-formulated fertilizer ONLY (e.g. rhododendron/azalea feed or ammonium sulfate)."},{"Plant":"🫐 Blueberry","Genus":"Vaccinium corymbosum – Sunshine Blue","Soil Used":"Acidic","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"50–80 mg/L","P\n(mg/L)":"30–50 mg/L","K\n(mg/L)":"150–250 mg/L","Calcium (Ca)":"Low-Moderate – 80–120 ppm","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 3–5 ppm – maintain Fe throughout fruiting or berries yellow\nBoron (B): 0.3–0.5 ppm – fruit set\nManganese (Mn): 2 ppm\nZinc (Zn): 1 ppm – berry size","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"⚠️ SPECIAL: Reduce acid fertilizer to ½ dose at fruiting. Increase K using acidic potassium source (potassium sulfate)."},{"Plant":"🍅 Cherry Tomato","Genus":"Cherry Tomato Red","Soil Used":"Potting","Growth Stage":"Seedling\n(weeks 1–3)","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"2","N\n(mg/L)":"80–130 mg/L","P\n(mg/L)":"50–80 mg/L","K\n(mg/L)":"80–130 mg/L","Calcium (Ca)":"High – 150–200 ppm\nProne to blossom-end rot — start Ca supplementation early.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Iron (Fe): 2–3 ppm – prevents yellowing\nSulfur (S): 50 ppm – enzyme activity\nBoron (B): 0.5 ppm – cell division","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at ½ strength. CalMag every watering from the start."},{"Plant":"🍅 Cherry Tomato","Genus":"Cherry Tomato Red","Soil Used":"Potting","Growth Stage":"Vegetative\n(weeks 4–7)","N\n(ratio)":"3.5","P\n(ratio)":"1","K\n(ratio)":"4","N\n(mg/L)":"130–200 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"180–250 mg/L","Calcium (Ca)":"High – 180–220 ppm\nKeep Ca elevated — cherry tomatoes are BER-prone varieties.","Magnesium (Mg)":"Moderate – 50–70 ppm","Other Nutrients":"Manganese (Mn): 1–2 ppm\nZinc (Zn): 0.5 ppm\nCopper (Cu): trace","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at full dose. Add HIGH-K at ½ dose. CalMag every watering — do not skip."},{"Plant":"🍅 Cherry Tomato","Genus":"Cherry Tomato Red","Soil Used":"Potting","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1.5","P\n(ratio)":"1","K\n(ratio)":"6","N\n(mg/L)":"70–110 mg/L","P\n(mg/L)":"60–80 mg/L","K\n(mg/L)":"320–420 mg/L","Calcium (Ca)":"Very High – 200–250 ppm\nNever reduce Ca at this stage — critical for preventing BER.","Magnesium (Mg)":"Moderate – 50–60 ppm","Other Nutrients":"Boron (B): 0.5–1 ppm – essential for pollen & fruit set\nSilica (Si): 50–100 ppm – strengthens cell walls\nSulfur (S): 50 ppm – contributes to flavour complexity","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch fully to HIGH-K fert. Minimal HIGH-N (¼ dose max). CalMag every watering."},{"Plant":"🍓 Strawberry 'Meraldo'","Genus":"Fragaria × ananassa","Soil Used":"Potting","Growth Stage":"Seedling /\nEstablishment\n(weeks 1–3)","N\n(ratio)":"2","P\n(ratio)":"1","K\n(ratio)":"2","N\n(mg/L)":"60–100 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"80–120 mg/L","Calcium (Ca)":"Moderate – 130–160 ppm\nCa important from the start — strawberries are prone to tip burn with Ca deficiency.","Magnesium (Mg)":"Low-Moderate – 30–50 ppm","Other Nutrients":"Iron (Fe): 2 ppm – prevents chlorosis in young leaves\nBoron (B): 0.3 ppm – early cell division\nZinc (Zn): 0.5 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at ½ strength. CalMag every watering from day 1. Keep EC low (0.8–1.2)."},{"Plant":"🍓 Strawberry 'Meraldo'","Genus":"Fragaria × ananassa","Soil Used":"Potting","Growth Stage":"Vegetative /\nRunner & Crown\n(weeks 4–8)","N\n(ratio)":"3","P\n(ratio)":"1","K\n(ratio)":"3","N\n(mg/L)":"100–150 mg/L","P\n(mg/L)":"40–60 mg/L","K\n(mg/L)":"120–180 mg/L","Calcium (Ca)":"Moderate-High – 150–180 ppm\nCalcium supports cell wall integrity in young tissue. Keep CalMag consistent.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Manganese (Mn): 1–2 ppm\nZinc (Zn): 0.5–1 ppm\nBoron (B): 0.3–0.5 ppm – critical for flower initiation\nSulfur (S): 30–50 ppm","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"HIGH-N fert at ¾ strength. Add HIGH-K at ¼ dose as plant approaches flowering. CalMag every watering."},{"Plant":"🍓 Strawberry 'Meraldo'","Genus":"Fragaria × ananassa","Soil Used":"Potting","Growth Stage":"Flowering &\nFruiting","N\n(ratio)":"1","P\n(ratio)":"1","K\n(ratio)":"5","N\n(mg/L)":"60–90 mg/L","P\n(mg/L)":"60–80 mg/L","K\n(mg/L)":"200–280 mg/L","Calcium (Ca)":"High – 160–200 ppm\nCalcium keeps fruit firm and prevents tip burn and fruit rot. Maintain consistently.","Magnesium (Mg)":"Moderate – 40–60 ppm","Other Nutrients":"Boron (B): 0.5–1 ppm – essential for pollen viability and fruit set\nSilica (Si): 30–50 ppm – firms fruit skin\nZinc (Zn): 1 ppm – fruit size and sugar\nSulfur (S): 30–50 ppm – flavour compounds","Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)":"Switch to HIGH-K fert as main feed. Reduce HIGH-N to ¼ dose max. CalMag every watering."}];

// ── State ─────────────────────────────────────────────────────────────────────
let data = [];
let plantPrefs = {}; // { "PlantName": { on: bool, stage: string } }

// ── Helpers ───────────────────────────────────────────────────────────────────
const gv = id => document.getElementById(id);
const g  = k  => { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } };
const s  = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const esc = str => String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function getN(r)   { return r['N\n(ratio)'] || ''; }
function getP(r)   { return r['P\n(ratio)'] || ''; }
function getK(r)   { return r['K\n(ratio)'] || ''; }
function getNmgl(r){ return r['N\n(mg/L)'] || ''; }
function getPmgl(r){ return r['P\n(mg/L)'] || ''; }
function getKmgl(r){ return r['K\n(mg/L)'] || ''; }
function getCa(r)  { return r['Calcium (Ca)'] || ''; }
function getMg(r)  { return r['Magnesium (Mg)'] || ''; }
function getOther(r){ return r['Other Nutrients'] || ''; }
function getTips(r){ return r['Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)'] || ''; }

function stageBadgeClass(stage) {
  const s = (stage||'').toLowerCase();
  if (s.includes('seedling')) return 'seedling';
  if (s.includes('flush'))    return 'flush';
  if (s.includes('year') || s.includes('herb') || s.includes('maintenance')) return 'year';
  if (s.includes('flower') || s.includes('fruit') || s.includes('bud') || s.includes('pre-flower') || s.includes('swelling') || s.includes('tuber') || s.includes('ripening') || s.includes('colour')) return 'fruit';
  return 'veg';
}

// Get unique plant names in order
function getPlantNames() {
  const seen = new Set();
  const names = [];
  data.forEach(r => { if (!seen.has(r['Plant'])) { seen.add(r['Plant']); names.push(r['Plant']); } });
  return names;
}

// Get all stages for a given plant name
function getStagesFor(plantName) {
  return data.filter(r => r['Plant'] === plantName).map(r => r['Growth Stage']);
}

// Get the data row for plant + stage
function getRowFor(plantName, stage) {
  return data.find(r => r['Plant'] === plantName && r['Growth Stage'] === stage) || null;
}

// ── Load / Save ───────────────────────────────────────────────────────────────
function loadAll() {
  data       = g(DATA_KEY)        || JSON.parse(JSON.stringify(DEFAULT_DATA));
  plantPrefs = g(PLANT_PREFS_KEY) || {};

  // Seed prefs for any plant not yet seen — default on, first stage selected
  getPlantNames().forEach(name => {
    if (!plantPrefs[name]) {
      const stages = getStagesFor(name);
      plantPrefs[name] = { on: true, stage: stages[0] || '' };
    }
  });
}

function savePrefs() { s(PLANT_PREFS_KEY, plantPrefs); }
function saveData()  { s(DATA_KEY, data); }

// ── PAGE 1: Plant dashboard ───────────────────────────────────────────────────
function renderPlantDashboard() {
  const search  = (gv('p1-search')?.value || '').toLowerCase();
  const names   = getPlantNames().filter(n => !search || n.toLowerCase().includes(search));
  const activeCount = getPlantNames().filter(n => plantPrefs[n]?.on).length;
  gv('p1-active-count').textContent = `${activeCount} active`;

  gv('plant-rows').innerHTML = names.map(name => {
    const pref   = plantPrefs[name] || { on: true, stage: getStagesFor(name)[0] || '' };
    const stages = getStagesFor(name);
    const emoji  = name.split(' ')[0];
    const label  = name.replace(/^\S+\s*/, ''); // remove leading emoji
    const isOn   = pref.on;

    const stageOptions = stages.map(st =>
      `<option value="${esc(st)}" ${st === pref.stage ? 'selected' : ''}>${st.replace(/\n/g,' ')}</option>`
    ).join('');

    return `
      <div class="plant-row${isOn ? '' : ' off'}" id="row-${esc(name)}">
        <label class="toggle toggle-wrap" title="${isOn ? 'Disable' : 'Enable'} ${label}">
          <input type="checkbox" ${isOn ? 'checked' : ''} onchange="togglePlant('${esc(name)}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
        <div class="plant-row-emoji">${emoji}</div>
        <div class="plant-row-name">${label}<small>${data.find(r=>r['Plant']===name)?.['Genus'] || ''}</small></div>
        <select class="plant-row-select" onchange="setPlantStage('${esc(name)}', this.value)">
          ${stageOptions}
        </select>
      </div>`;
  }).join('');
}

function togglePlant(name, on) {
  if (!plantPrefs[name]) plantPrefs[name] = { on: true, stage: getStagesFor(name)[0] || '' };
  plantPrefs[name].on = on;
  savePrefs();
  renderPlantDashboard();
  renderCards();
}

function setPlantStage(name, stage) {
  if (!plantPrefs[name]) plantPrefs[name] = { on: true, stage };
  plantPrefs[name].stage = stage;
  savePrefs();
  renderCards();
}

// ── PAGE 2: Cards ─────────────────────────────────────────────────────────────
function renderCards() {
  const search = (gv('p2-search')?.value || '').toLowerCase();
  const names  = getPlantNames();
  const rows   = [];

  names.forEach(name => {
    const pref = plantPrefs[name];
    if (!pref?.on) return;
    const row = getRowFor(name, pref.stage);
    if (!row) return;
    if (search && !name.toLowerCase().includes(search) && !(row['Genus']||'').toLowerCase().includes(search)) return;
    rows.push(row);
  });

  gv('p2-count').textContent = `(${rows.length})`;

  if (!rows.length) {
    gv('p2-cards').innerHTML = `<div class="no-cards">No active plants. Toggle some on in "Your Plants".</div>`;
    return;
  }

  gv('p2-cards').innerHTML = rows.map(r => `
    <div class="plant-card">
      <div class="card-head">
        <div class="card-plant-name">${r['Plant']}</div>
        <div class="card-meta">
          <span class="card-tag"><i class="ti ti-dna" style="font-size:12px"></i>${r['Genus']}</span>
          <span class="card-tag"><i class="ti ti-shovel" style="font-size:12px"></i>${r['Soil Used']||'—'}</span>
          <span class="stage-badge ${stageBadgeClass(r['Growth Stage'])}">${r['Growth Stage'].replace(/\n/g,' ')}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="npk-row">
          <div class="npk-box n"><div class="lbl">N ratio</div><div class="val">${getN(r)}</div></div>
          <div class="npk-box p"><div class="lbl">P ratio</div><div class="val">${getP(r)}</div></div>
          <div class="npk-box k"><div class="lbl">K ratio</div><div class="val">${getK(r)}</div></div>
        </div>
        <div class="npk-row">
          <div class="npk-box n"><div class="lbl">N mg/L</div><div class="val" style="font-size:11px">${getNmgl(r)}</div></div>
          <div class="npk-box p"><div class="lbl">P mg/L</div><div class="val" style="font-size:11px">${getPmgl(r)}</div></div>
          <div class="npk-box k"><div class="lbl">K mg/L</div><div class="val" style="font-size:11px">${getKmgl(r)}</div></div>
        </div>
        ${getCa(r)    ? `<div class="card-divider"></div><div><div class="card-section-label">Calcium (Ca)</div><div class="card-section-text">${esc(getCa(r))}</div></div>` : ''}
        ${getMg(r)    ? `<div><div class="card-section-label">Magnesium (Mg)</div><div class="card-section-text">${esc(getMg(r))}</div></div>` : ''}
        ${getOther(r) ? `<div><div class="card-section-label">Other Nutrients</div><div class="card-section-text">${esc(getOther(r))}</div></div>` : ''}
        ${getTips(r)  ? `<div class="card-divider"></div><div><div class="card-section-label" style="color:var(--accent)">Fertilizer Tips</div><div class="card-section-text">${esc(getTips(r))}</div></div>` : ''}
      </div>
    </div>`).join('');
}

// ── PAGE 3: Editor ────────────────────────────────────────────────────────────
function renderEditor() {
  const search = (gv('p3-search')?.value || '').toLowerCase();
  const rows   = data.filter(r => !search || r['Plant'].toLowerCase().includes(search) || (r['Genus']||'').toLowerCase().includes(search));
  gv('p3-count').textContent = `(${data.length} total)`;
  gv('p3-tbody').innerHTML = rows.map(r => {
    const idx = data.indexOf(r);
    return `<tr>
      <td><strong>${r['Plant']}</strong></td>
      <td style="color:var(--text2);font-size:12px">${r['Genus']}</td>
      <td style="font-size:12px">${r['Soil Used']||'—'}</td>
      <td><span class="stage-badge ${stageBadgeClass(r['Growth Stage'])}">${r['Growth Stage'].replace(/\n/g,' ')}</span></td>
      <td class="npk-pill">${getN(r)}:${getP(r)}:${getK(r)}</td>
      <td><div class="row-actions">
        <button class="btn sm" onclick="openModal(${idx})"><i class="ti ti-edit"></i></button>
        <button class="btn sm danger" onclick="deleteRow(${idx})"><i class="ti ti-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

// ── Modal ─────────────────────────────────────────────────────────────────────
let editIdx = null;
function openModal(idx) {
  editIdx = idx;
  gv('modal-title').textContent = idx === null ? 'Add plant' : 'Edit plant';
  const r = idx !== null ? data[idx] : {};
  gv('f-plant').value   = r['Plant'] || '';
  gv('f-genus').value   = r['Genus'] || '';
  gv('f-soil').value    = r['Soil Used'] || '';
  gv('f-stage').value   = (r['Growth Stage']||'').replace(/\n/g,' ');
  gv('f-n-ratio').value = getN(r);
  gv('f-p-ratio').value = getP(r);
  gv('f-k-ratio').value = getK(r);
  gv('f-n-mgl').value   = getNmgl(r);
  gv('f-p-mgl').value   = getPmgl(r);
  gv('f-k-mgl').value   = getKmgl(r);
  gv('f-ca').value      = getCa(r);
  gv('f-mg').value      = getMg(r);
  gv('f-other').value   = getOther(r);
  gv('f-tips').value    = getTips(r);
  gv('modal-overlay').classList.add('open');
  gv('f-plant').focus();
}
function closeModal()               { gv('modal-overlay').classList.remove('open'); editIdx = null; }
function closeModalOutside(e)       { if (e.target === gv('modal-overlay')) closeModal(); }

function saveEntry() {
  const entry = {
    'Plant':      gv('f-plant').value.trim(),
    'Genus':      gv('f-genus').value.trim(),
    'Soil Used':  gv('f-soil').value.trim(),
    'Growth Stage': gv('f-stage').value.trim(),
    'N\n(ratio)': gv('f-n-ratio').value.trim(),
    'P\n(ratio)': gv('f-p-ratio').value.trim(),
    'K\n(ratio)': gv('f-k-ratio').value.trim(),
    'N\n(mg/L)':  gv('f-n-mgl').value.trim(),
    'P\n(mg/L)':  gv('f-p-mgl').value.trim(),
    'K\n(mg/L)':  gv('f-k-mgl').value.trim(),
    'Calcium (Ca)':  gv('f-ca').value.trim(),
    'Magnesium (Mg)':gv('f-mg').value.trim(),
    'Other Nutrients':gv('f-other').value.trim(),
    'Your Fertilizer Tips\n(High-N / High-K / Canna CalMag)':gv('f-tips').value.trim(),
  };
  if (!entry['Plant']) { alert('Plant name is required.'); return; }
  if (editIdx !== null) {
    data[editIdx] = { ...data[editIdx], ...entry };
  } else {
    data.push(entry);
    // Auto-seed prefs for new plant
    if (!plantPrefs[entry['Plant']]) {
      plantPrefs[entry['Plant']] = { on: true, stage: entry['Growth Stage'] };
    }
  }
  saveData(); savePrefs();
  closeModal();
  renderAll();
  showToast(editIdx !== null ? 'Plant updated.' : 'Plant added.');
}

function deleteRow(idx) {
  if (!confirm(`Delete "${data[idx]['Plant']}" (${data[idx]['Growth Stage'].replace(/\n/g,' ')})?`)) return;
  data.splice(idx, 1);
  saveData();
  renderAll();
  showToast('Entry deleted.');
}

function resetToDefault() {
  if (!confirm('Reset all data and preferences to the original spreadsheet?')) return;
  data       = JSON.parse(JSON.stringify(DEFAULT_DATA));
  plantPrefs = {};
  saveData(); savePrefs();
  loadAll();
  renderAll();
  showToast('Data reset to original.');
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'plant_nutrient_guide.json';
  a.click();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = gv('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(idx) {
  document.querySelectorAll('.page').forEach((p,i)   => p.classList.toggle('active', i===idx));
  document.querySelectorAll('.nav-tab').forEach((t,i) => t.classList.toggle('active', i===idx));
}

// ── Boot ──────────────────────────────────────────────────────────────────────
function renderAll() {
  renderPlantDashboard();
  renderCards();
  renderEditor();
}

loadAll();
renderAll();
