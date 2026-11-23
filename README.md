# 🍟 McDonald's Landscape Self-Service Kiosk (Kiosk Samoobsługowy)

W pełni funkcjonalna, nowoczesna replika kiosku samoobsługowego **McDonald's Polska**, zaprojektowana i zoptymalizowana specjalnie pod **ekrany poziome (landscape / panoramiczne 16:9, tablety, telewizory dotykowe, monitory kioskowe)**.

Aplikacja jest napisana w **Node.js + React + TypeScript + Vite + Tailwind CSS** i przygotowana do natychmiastowego uruchomienia oraz wdrożenia w **Coolify** (lub dowolnym środowisku Docker).

---

## 🌟 Główne Funkcje i Możliwości

### 1. Układ poziomy (Landscape Kiosk UI)
- **Ekran powitalny (Attract Screen)**: Kultowy ekran "Dotknij, aby rozpocząć" z zimową kampanią **Burger Drwala**, wyborem trybu spożycia (**Zjedz na miejscu** / **Na wynos**) oraz flagami językowymi (**PL**, **EN**, **UA**).
- **Lewy pasek kategorii (Sidebar Rail)**: Złociste podświetlenia, ikony, skróty do wszystkich działów menu (Drwal / Co nowego, Burgery, Kurczak, McWrapy & Sałatki, Frytki & Dodatki, Lody & Desery, McCafé, Napoje, Śniadania, Happy Meal, 2 for U, McZestawy).
- **Centrum (Siatka produktów)**: Kafelki z oficjalnymi przezroczystymi zdjęciami PNG w wysokiej rozdzielczości prosto z CDN McDonald's Polska, badge ("ZIMOWY HIT", "IKONA", "PREMIUM", "WEGE"), kalorie i ceny w PLN.
- **Prawa tacka (Cart Tray)**: Podgląd zamówienia na żywo z wyszczególnionymi modyfikacjami składników, wyborem napojów i sosów, kontrolą ilości (+ / -) oraz wielkim zielonym przyciskiem **ZAMAWIAM I PŁACĘ**.

### 2. Pełna baza produktów i opcji
- Ponad **150 pozycji** pobranych bezpośrednio z `mcdonalds.pl/nasze-menu/`.
- **Modyfikacja składników**: Możliwość usunięcia pikli, cebuli, sosu, sera, sałaty lub dodania dodatkowego mięsa (wołowina 100%), chrupiącego bekonu, sera cheddar, jalapeno czy podwójnego sosu.
- **Rozmiar zestawu**: Wybór pomiędzy samym produktem, McZestawem (ze średnimi frytkami i napojem 0.4l) oraz McZestawem Powiększonym (z dużymi frytkami i napojem 0.5l).
- **Wybór sosów i dodatków**: Frytki Zakręcone z sosem, serki brie, sosy (słodko-kwaśny, barbecue, czosnkowy, mayo sriracha, blue cheese, dip żurawinowy itd.).
- **Ekran sugestii (Upsell Modal)**: Kultowy ekran z deserami przed płatnością (McFlurry Zimowe Snickers, Ciastko Apple Pie, Piernikowa Latte).

### 3. Realistyczna symulacja płatności (Fake POS Terminal)
- Wybór metody: **Karta płatnicza** (zbliżeniowo / Apple Pay), **BLIK**, **Płatność przy kasie**.
- **Symulator fizycznego terminala płatniczego**:
  - Wyświetlacz LCD z kwotą do zapłaty w PLN.
  - Komunikat: *"POSTĘPUJ ZGODNIE Z INSTRUKCJAMI NA TERMINALU PŁATNICZYM"*.
  - Sekwencja diod LED NFC (Niebieska -> Żółta -> Zielona).
  - Animacja karty płatniczej zbliżającej się do czytnika.
  - Przycisk symulacji zbliżenia karty (oraz automatyczna autoryzacja po 3.5s).
  - Dźwięki POS i autoryzacji zrealizowane za pomocą Web Audio API.

### 4. Potwierdzenie zamówienia i wydruk paragonu
- Ogromny numer zamówienia (np. **#42**) wyświetlany w stylistyce Maka.
- Instrukcje odbioru i status przygotowania w kuchni.
- **Animowany paragon fiskalny**: Wysuwający się z wirtualnego slotu drukarki paragon z NIP-em, wykazem pozycji, podatkiem VAT 8%/23%, kodem kreskowym i QR kodem do punktów MojeM.
- Automatyczny licznik resetujący ekran do trybu powitalnego.

---

## 🚀 Uruchomienie lokalne

### Wymagania
- Node.js 18+ (zalecane Node 20 LTS)
- npm

### Krok po kroku:
```bash
# 1. Instalacja zależności
npm install

# 2. Zbudowanie frontendu Vite
npm run build

# 3. Uruchomienie serwera produkcyjnego
npm start
```
Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

Do pracy developerskiej (z hot-reload Vite):
```bash
npm run dev
```

---

## 🐳 Wdrożenie w Coolify (Docker)

Aplikacja jest w 100% zoptymalizowana pod Coolify:
- Zawiera wieloetapowy `Dockerfile` na bazie `node:20-alpine`.
- Posiada wbudowany endpoint `/health` do sprawdzania stanu kontenera.
- Nasłuchuje na standardowym porcie `3000` (konfigurowanym przez zmienną środowiskową `PORT`).

### Kroki wdrożenia w Coolify:
1. W Coolify utwórz nowy projekt i wybierz **Application**.
2. Wskaż repozytorium Git (po wypchnięciu kodu).
3. Jako **Build Pack** wybierz **Dockerfile** (Coolify automatycznie wykryje dołączony plik `Dockerfile`).
4. Port kontenera: `3000`.
5. Health check path: `/health`.
6. Kliknij **Deploy** – aplikacja zbuduje się i uruchomi w kilka sekund!

Możesz także uruchomić kontener lokalnie za pomocą Docker Compose:
```bash
docker compose up -d
```

---

## 📁 Struktura Projektu

```
├── Dockerfile                  # Wieloetapowy build produkcyjny (Coolify)
├── docker-compose.yml          # Konfiguracja Docker Compose
├── server.js                   # Serwer produkcyjny Express (API + statyki)
├── data/
│   ├── menu.json               # Baza 150+ produktów z mcdonalds.pl z parametrami
│   └── config.json             # Konfiguracja kategorii, składników, sosów, napojów
├── src/
│   ├── components/
│   │   ├── AttractScreen.tsx           # Ekran powitalny (startowy)
│   │   ├── Header.tsx                  # Pasek górny (logo, zegar, tryb zamówienia, język)
│   │   ├── Sidebar.tsx                 # Lewy pasek kategorii
│   │   ├── ProductCard.tsx             # Kafelek produktu z grafiką CDN
│   │   ├── CartTray.tsx                # Prawa tacka zamówienia z podsumowaniem
│   │   ├── CustomizationModal.tsx      # Modal konfiguracji burgera / zestawu
│   │   ├── UpsellModal.tsx             # Sugestie deserów przed płatnością
│   │   ├── PaymentModal.tsx            # Symulator terminala płatniczego
│   │   └── OrderConfirmationScreen.tsx # Numer zamówienia i animowany paragon
│   ├── utils/
│   │   ├── audio.ts                    # Efekty dźwiękowe Web Audio API (POS beepy)
│   │   └── translations.ts             # Tłumaczenia (PL, EN, UA)
│   ├── types/
│   │   └── index.ts                    # Interfejsy TypeScript
│   ├── App.tsx                         # Główny orchestrator aplikacji
│   └── main.tsx                        # Punkt wejściowy React
└── package.json
```
