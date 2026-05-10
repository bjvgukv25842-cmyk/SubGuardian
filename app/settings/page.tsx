import { SettingsClient } from "@/components/SettingsClient";
import { isApiAuthConfigured } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <SettingsClient
      computeMock={process.env.ENABLE_MOCK_COMPUTE !== "false" || !process.env.ZERO_G_COMPUTE_API_KEY}
      storageMock={process.env.ENABLE_MOCK_STORAGE !== "false" || !process.env.ZERO_G_STORAGE_SERVER_PRIVATE_KEY}
      apiAuthConfigured={isApiAuthConfigured()}
    />
  );
}
