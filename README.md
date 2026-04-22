# Insighta Labs — Demographic Intelligence API

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Prisma](https://img.shields.io/badge/Prisma-Active-darkblue)
![Express.js](https://img.shields.io/badge/Express.js-Framework-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green)

## What the project does

Insighta Labs Demographic Intelligence API is a queryable backend engine built for marketing teams, product teams, and growth analysts who need to slice and query demographic data fast.

The system stores 2026 demographic profiles and exposes endpoints that support advanced filtering, sorting, pagination, and natural language search — allowing clients to express queries in plain English and get structured results back instantly.

---

## Why the project is useful

- **Advanced Filtering** — filter profiles by gender, age group, country, age range, and confidence scores, all combinable in a single request
- **Sorting & Pagination** — sort by age, creation date, or gender probability; paginate through large result sets efficiently
- **Natural Language Search** — query the dataset in plain English e.g. `young males from nigeria` without writing structured filters manually
- **Rule-based NLP** — fast, predictable, zero-cost parsing with no dependency on external AI services
- **Performance** — uses indexed queries and `Promise.all` for parallel count + data fetching to avoid unnecessary full-table scans
- **Clean Error Handling** — all errors follow a consistent structure with appropriate HTTP status codes

---

## How users can get started

### Prerequisites

- [Node.js](https://nodejs.org/en/) v18 or newer
- A PostgreSQL database (e.g. [Neon](https://neon.tech))

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd stage1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```ini
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   PORT=3000
   ```

4. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Seed the database:**
   ```bash
   npx prisma db seed
   ```
   This loads all 2026 profiles from `seed_profiles.json`. Re-running is safe — existing records are skipped automatically.

6. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`.

---

## Endpoints

### GET /api/profiles

Returns all profiles with support for filtering, sorting, and pagination.

**Supported query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `gender` | string | `male` or `female` |
| `age_group` | string | `child`, `teenager`, `adult`, `senior` |
| `country_id` | string | ISO 2-letter code e.g. `NG`, `KE`, `GH` |
| `min_age` | number | Minimum age (inclusive) |
| `max_age` | number | Maximum age (inclusive) |
| `min_gender_probability` | number | Minimum gender confidence score |
| `min_country_probability` | number | Minimum country confidence score |
| `sort_by` | string | `age`, `created_at`, `gender_probability` |
| `order` | string | `asc` or `desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10, max: 50) |

**Example:**
```bash
curl "http://localhost:3000/api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10"
```

**Response:**
```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 120,
  "data": [
    {
      "id": "b3f9c1e2-7d4a-4c91-9c2a-1f0a8e5b6d12",
      "name": "emmanuel",
      "gender": "male",
      "gender_probability": 0.99,
      "age": 34,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.85,
      "created_at": "2026-04-01T12:00:00.000Z"
    }
  ]
}
```

---

### GET /api/profiles/search

Converts a plain English query into structured filters and returns matching profiles.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Natural language query (required) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10, max: 50) |

**Example:**
```bash
curl "http://localhost:3000/api/profiles/search?q=young males from nigeria&page=1&limit=10"
```

**Response:**
```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 45,
  "data": [ ... ]
}
```

**Uninterpretable query:**
```json
{
  "status": "error",
  "message": "Unable to interpret query"
}
```

---

## Natural Language Parsing Approach

The parser is **fully rule-based** — no AI or LLMs are used at any point. It works by lowercasing the query string and scanning for known keywords using regular expressions, in five sequential steps:

**Step 1 — Clean input**  
Lowercases and trims the query so `"Nigeria"`, `"NIGERIA"`, and `"nigeria"` all behave identically.

**Step 2 — Detect gender**  
Scans for gender keywords and sets `gender` filter. If both genders are mentioned (`male and female`, `both`), no gender filter is applied.

**Step 3 — Detect age group or "young"**  
Scans for age group keywords. `"young"` is a special case — it maps to a numeric age range (`min_age=16, max_age=24`), not a stored age group.

**Step 4 — Detect age range**  
Scans for numeric age patterns like `"above 30"`, `"under 25"`, `"between 20 and 40"` and extracts the numbers into `min_age` / `max_age`.

**Step 5 — Detect country**  
Checks the query against a hardcoded map of 65 country names → ISO codes. Longer country names are checked first to prevent partial matches (e.g. `"south africa"` is matched before `"africa"`).

**Step 6 — Return**  
If any filter was matched, returns the filters object. If nothing was matched at all, returns `null` → controller responds with `"Unable to interpret query"`.

### Supported Keywords

**Gender**

| Keyword | Maps to |
|---|---|
| male, males, man, men | `gender=male` |
| female, females, woman, women | `gender=female` |
| male and female, both | no gender filter |

**Age Groups**

| Keyword | Maps to |
|---|---|
| young | `min_age=16, max_age=24` |
| child, children, kid, kids | `age_group=child` |
| teenager, teenagers, teen, teens | `age_group=teenager` |
| adult, adults | `age_group=adult` |
| senior, seniors, elderly, old | `age_group=senior` |

**Age Range**

| Pattern | Maps to |
|---|---|
| above N, over N, older than N | `min_age=N` |
| below N, under N, younger than N | `max_age=N` |
| between N and M | `min_age=N, max_age=M` |

**Countries**  
All 65 countries present in the dataset are supported by full name.  
Examples: `nigeria → NG`, `kenya → KE`, `south africa → ZA`, `ghana → GH`, `ethiopia → ET`

### Example Mappings

| Query | Parsed Filters |
|---|---|
| `young males` | gender=male, min_age=16, max_age=24 |
| `females above 30` | gender=female, min_age=30 |
| `people from angola` | country_id=AO |
| `adult males from kenya` | gender=male, age_group=adult, country_id=KE |
| `male and female teenagers above 17` | age_group=teenager, min_age=17 |
| `seniors in nigeria` | age_group=senior, country_id=NG |
| `women under 25 from ghana` | gender=female, max_age=25, country_id=GH |

---

## Limitations

- **No typo tolerance** — `"nigera"` will not match `"nigeria"`
- **No synonyms beyond defined keywords** — `"guys"`, `"boys"`, `"gents"` are not mapped to male
- **Single country only** — `"males from nigeria or ghana"` only matches the first country found; multiple countries in one query are not supported
- **No negation** — `"males not from nigeria"` is not supported and will be misinterpreted
- **No name-based queries** — `"people named john"` is not supported
- **No profession or attribute queries** — `"developers"`, `"students"` are not parsed
- **"young" is not a stored age group** — it is a parser shortcut for ages 16–24 only and does not map to the `age_group` column
- **No fuzzy matching** — exact keyword matches only; partial or misspelled words are ignored
- **No complex boolean logic** — `"adults and seniors"` or `"male or female above 30"` are not handled correctly

---

## Error Responses

All errors follow this structure:

```json
{ "status": "error", "message": "<error message>" }
```

| Status Code | Meaning |
|---|---|
| 400 | Missing or empty parameter |
| 422 | Invalid parameter type or value |
| 404 | Profile not found |
| 500 / 502 | Server failure |

---

## Where users can get help

- **Bug Reports & Feature Requests** — open a ticket in the [Issues](../../issues) tab
- **Express.js Docs** — [expressjs.com](https://expressjs.com/)
- **Prisma Docs** — [prisma.io/docs](https://www.prisma.io/docs/)
- **TypeScript Docs** — [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
- **Neon (PostgreSQL)** — [neon.tech](https://neon.tech)

---

## Who maintains and contributes

This project is maintained as part of the Insighta Labs backend engineering track.

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "add: your feature"`
4. Push and open a Pull Request

Please ensure your code compiles with `npm run build` before submitting a PR.