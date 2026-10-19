import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PlacementMetrics from "../../components/placements/PlacementMetrics";
import StatisticsChart from "../../components/placements/StatisticsChart";
import CompanyTable from "../../components/tables/BasicTables/CompanyTable1";
import StaffTable from "../../components/tables/BasicTables/StaffTable1";
import StudentTable from "../../components/tables/BasicTables/StudentTable1";

export default function Home() {
  return (
    <>
    <div className="bg:gray-100 md:p-6 dark:bg-black">
      <PageMeta
        title="PLACEMENT CELL"
        description="This is React.js Placement Cell project coordinates the details and data in the college."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-12 xl:col-span-12">
          <PlacementMetrics />
        </div>
 
        <div className="col-span-12 xl:col-span-6">
          <div className="space-y-6">
            <ComponentCard title="Staff Table">
              <StaffTable />
            </ComponentCard>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <div className="space-y-6">
            <ComponentCard title="Company Table">
              <CompanyTable />
            </ComponentCard>
          </div>
        </div>

        <div className="col-span-12">
          <div className="space-y-6">
            <ComponentCard title="Student Table">
              <StudentTable />
            </ComponentCard>
          </div>
        </div>

        <div className="col-span-12">
          <div className="space-y-6">
            <ComponentCard title="Placement Metrics">
              <StatisticsChart />
            </ComponentCard>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
