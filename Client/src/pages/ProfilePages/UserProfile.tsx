import UserMetaCard from "../../components/UserProfile/UserMetaCard";
import UserInfoCard from "../../components/UserProfile/UserInfoCard";
import UserPrivilegesCard from "../../components/UserProfile/UserPrivilegesCard";

export default function ProfilePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white shadow-md rounded-2xl p-6">
        <UserMetaCard />
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6">
        <UserInfoCard />
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6">
        <UserPrivilegesCard />
      </div>
    </div>
    
  );
}

