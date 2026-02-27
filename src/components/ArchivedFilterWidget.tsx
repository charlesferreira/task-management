import { Archive } from "lucide-react";
import BottomActionButton from "./BottomActionButton";

type ArchivedFilterWidgetProps = {
  isActive: boolean;
  onToggle: () => void;
};

const ArchivedFilterWidget = ({
  isActive,
  onToggle,
}: ArchivedFilterWidgetProps) => {
  return (
    <BottomActionButton
      isOpen={isActive}
      onToggle={onToggle}
      onClose={() => {}}
      icon={<Archive className="h-5 w-5" strokeWidth={2.25} />}
      activeLabel="Archived"
      ariaLabel="Toggle archived tasks filter"
      title="Archived filter"
      containerClassName="fixed bottom-6 left-34 z-30"
    />
  );
};

export default ArchivedFilterWidget;
