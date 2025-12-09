# WTM Admin Dashboard

An admin dashboard for managing hotel bookings, listings, promotions, and user accounts. Built with Next.js 15, React 19, and TypeScript, featuring a modern UI with ShadCN UI components.

## Technology Stack

### Core Framework

- **Next.js 15.3.6** - React framework
- **React 19**
- **TypeScript 5**

### Authentication

- **NextAuth.js 4.24** - Authentication and session management

### UI & Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **ShadCN UI** - Base UI Component

### Forms & Validation

- **React Hook Form 7** - form state management
- **Zod 3.25** - Schema validation

### Data Management

- **TanStack Table 8** - Table library
- **nuqs** - URL state management

### File Handling & Export

- **XLSX** - Excel file generation
- **@react-pdf/renderer** - PDF generation

### Rich Text Editing

- **Tiptap 3** - Extensible rich text editor

## Project Structure

The project follows Next.js 15 App Router architecture:

### Pages (App Router)

All pages are located in the `app/` directory:

```

app/

├── (dashboard)/ # Protected dashboard routes

│ ├── account/

│ │ ├── agent-overview/page.tsx

│ │ ├── role-based-access/page.tsx

│ │ └── user-management/page.tsx

│ ├── banner/page.tsx

│ ├── booking-management/

│ │ ├── booking-summary/page.tsx

│ │ └── history-booking-log/page.tsx

│ ├── hotel-listing/

│ │ ├── page.tsx # Hotel list

│ │ ├── create/page.tsx # Create hotel

│ │ └── [id]/edit/page.tsx # Edit hotel

│ ├── promo/page.tsx

│ ├── promo-group/page.tsx

│ ├── report/page.tsx

│ └── settings/

│ ├── account-setting/page.tsx

│ ├── email-log/page.tsx

│ └── email-setting/page.tsx

├── login/page.tsx

├── forgot-password/page.tsx

└── reset-password/page.tsx

```

### Actions & Fetch Files

Each feature typically has two server-side files:

- **`actions.ts`** - Server actions for mutations (create, update, delete)

- **`fetch.ts`** - Data fetching functions for queries

- **`types.ts`** - TypeScript type definitions for the feature

```

app/(dashboard)/

├── banner/

│ ├── actions.ts # Server actions (create, update, delete banner)

│ ├── fetch.ts # Data fetching (get banners list)

│ └── types.ts # Banner type definitions

├── hotel-listing/

│ ├── actions.ts # Hotel CRUD operations

│ ├── fetch.ts # Fetch hotels, rooms, etc.

│ └── types.ts # Hotel-related types

├── promo/

│ ├── actions.ts

│ ├── fetch.ts

│ └── types.ts

└── ... (same pattern for other features)

```

### Components

Components are organized by feature and reusability:

```

components/

├── dashboard/ # Feature-specific components

│ ├── banner/ # Banner

│ ├── booking-management/ # Booking-related components

│ ├── hotel-listing/ # Hotel forms, dialogs, tables

│ ├── promo/ # Promo components

│ ├── promo-group/ # Promo group components

│ ├── report/ # Report components

│ └── settings/ # Settings components

├── data-table/ # Reusable table components

├── login/ # Authentication forms

├── ui/ # Shared UI primitives (buttons, dialogs, forms)

└── providers/ # React context providers

```

## Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** (LTS recommended)

- **npm** (package manager)

### Step-by-Step Installation

1.  **Clone the repository**

```bash
git clone <repository-url>
cd wtm-admin
```

2.  **Install dependencies**

```bash
npm install
```

3.  **Configure environment variables**
    Create a `.env` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=<your-secret-key>
NEXTAUTH_URL=http://localhost:3000

# Backend API Base URL
AUTH_API_BASE_URL=http:/localhost:4816/api
```

**Required Environment Variables:**

- `NEXTAUTH_SECRET`: Random string for encrypting tokens (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your application URL (use `http://localhost:3000` for development)
- `AUTH_API_BASE_URL`: Backend API endpoint for authentication and data

4.  **Run the development server**

```bash
npm dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

5.  **Access the application**  
    Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

You'll be redirected to the login page. Use valid credentials provided by your backend API.

### Building for Production

1.  **Create an optimized production build**

```bash
npm build
```

2.  **Start the production server**

```bash
npm start
```

3.  **Preview the production build**
    The production server will run at [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |

| ------------ | ------------------------------------------------------------ |

| `npm dev` | Start development server with Turbopack (hot reload enabled) |

| `npm build` | Create optimized production build |

| `npm start` | Start production server |

### Development Notes

- **Image Optimization**: Next.js Image component is configured for multiple remote domains (see `next.config.ts`)

- **Server Actions**: Maximum body size is set to 10MB for file uploads
