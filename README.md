# Profile Estimator API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Prisma](https://img.shields.io/badge/Prisma-Active-darkblue)
![Express.js](https://img.shields.io/badge/Express.js-Framework-lightgrey)

## What the project does

This project is a RESTful API service built with Express.js and TypeScript that dynamically gathers and stores composite profile information about individuals based purely on their requested name.

When a user submits a person's first name, the API asynchronously queries three external probabilistic APIs—[Genderize](https://genderize.io/), [Agify](https://agify.io/), and [Nationalize](https://nationalize.io/)—to estimate their demographic features. The aggregated data is merged and securely stored in a PostgreSQL database using the Prisma ORM.

## Why the project is useful

Applications often need to approximate user demographics efficiently without lengthy manual forms. This API provides:

- **Data Aggregation**: Simultaneously fetches demographic data across multiple third-party services in parallel to minimize latency.
- **Idempotent Operations**: Seamlessly handles duplicated profile submissions to avoid redundant external API calls and database bloat.
- **Modern & Robust Stack**: Built natively with TypeScript for enhanced type safety, Prisma ORM for simplified database architecture, and Express.js for fast execution.
- **Cloud-Ready Deployment**: Includes `vercel.json` configured out of the box to deploy serverless Node.js endpoints directly to Vercel.

## How users can get started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
- A running PostgreSQL Database instance 

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd stage1
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your connection strings:
   ```ini
   DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name?schema=public"
   PORT=3000
   ```

4. **Initialize Database:**
   Generate the Prisma client and push the schema directly to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Application:**
   ```bash
   # Starts the development server using nodemon & tsx
   npm run dev
   ```

### Usage Examples

Your API will be running on `http://localhost:3000` (or the `PORT` specified in your `.env`).

**1. Create a New Profile**
Send a single name to estimate demographic attributes.
```bash
curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": "Alex"}'
```

*Example Response:*
```json
{
  "status": "success",
  "data": {
    "id": "cpt1::...",
    "name": "Alex",
    "gender": "male",
    "gender_probability": 0.85,
    "age": 32,
    "country_id": "US",
    "country_probability": 0.28
  }
}
```

**2. List & Filter Profiles**
You can retrieve all estimated profiles and optionally filter using query parameters.
```bash
# Get all profiles
curl http://localhost:3000/api/profiles

# Get profiles filtered by gender and country
curl http://localhost:3000/api/profiles?gender=male&country_id=US
```

**3. Retrieve a Specific Profile**
```bash
curl http://localhost:3000/api/profiles/<PROFILE_ID>
```

**4. Delete a Profile**
```bash
curl -X DELETE http://localhost:3000/api/profiles/<PROFILE_ID>
```

## Where users can get help

- **Bug Reports & Feature Requests**: Encounter an issue? Feel free to open a ticket in the [Issues](../../issues) tab of the repository.
- **External Framework Documentation**: 
  - [Express Framework Documentation](https://expressjs.com/)
  - [TypeScript Documentation](https://www.typescriptlang.org/docs/)
  - [Prisma ORM Getting Started](https://www.prisma.io/docs/)
- **Demographic Source APIs**: 
  - Explore the tools that gather the demographic data: [Genderize](https://genderize.io/), [Agify](https://agify.io/), and [Nationalize](https://nationalize.io/).

## Who maintains and contributes

This original structure is part of the HNG Tasks backend implementations. The project is currently maintained by Abdulhamid Eniola Adebimpe and various contributors. 

**Want to Contribute?**
Contributions are widely encouraged. Feel free to fork the repository, make beneficial changes, and create a Pull Request. For major changes, we ask that you please open an issue first to discuss what you would like to change. Ensure any new features include robust error handling mechanisms! 
