import { notFound } from 'next/navigation';
import Dashboard from '../components/Dashboard';
import { prisma } from '../lib/database';
import { Metadata } from 'next';
import Link from 'next/link'

interface DistrictPageProps {
  params: {
    district: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const district = await prisma.district.findUnique({
    where: { districtId: params.district },
  });

  if (!district) {
    return {
      title: 'District Not Found',
    };
  }

  return {
    title: `MGNREGS ${district.name} District Performance`,
    description: `View MGNREGS performance data for ${district.name} district, ${district.state}. Track employment, funds utilization, and participation rates.`,
  };
}

// Generate static params for better performance
export async function generateStaticParams() {
  const districts = await prisma.district.findMany({
    select: { districtId: true },
  });

  return districts.map((district: { districtId: string }) => ({
    district: district.districtId,
  }));
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const district = await prisma.district.findUnique({
    where: { districtId: params.district },
  });

  if (!district) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                MGNREGS Performance
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">📍</span>
                <span className="text-gray-600">
                  {district.name}, {district.state}
                </span>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span>←</span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Dashboard
          districtId={district.districtId}
          districtName={district.name}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>MGNREGS District Performance Dashboard</p>
            <p className="mt-1">
              Data sourced from Government of India Open API • Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}