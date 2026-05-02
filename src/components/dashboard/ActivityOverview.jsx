import { motion } from "framer-motion";
import { activityList } from "../../data/activityConfig";

export default function ActivityOverview({ data }) {
  const activityData = data?.dailyActivities || {};

  const completed = activityList.filter((item) => {
    return activityData[item.key] === true;
  }).length;

  const total = activityList.length;
  const pending = total - completed;

  const progress = (completed / total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white p-6 rounded-2xl shadow"
    >
      <h3 className="font-semibold mb-6">Today's Activity</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT SIDE → COUNT */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-gray-800">
            {completed} / {total}
          </div>

          <p className="text-gray-500 text-sm mt-1">
            Tasks Completed
          </p>

          {/* PROGRESS BAR */}
          <div className="w-full mt-4">
            <div className="h-3 bg-gray-200 rounded-full">
              <motion.div
                className="h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          {/* 🔔 REMINDER */}
          {pending > 0 ? (
            <p className="mt-4 text-sm text-red-500 font-medium text-center">
              ⚠️ {pending} task{pending > 1 ? "s" : ""} pending
            </p>
          ) : (
            <p className="mt-4 text-sm text-green-600 font-medium">
              🎉 All tasks completed!
            </p>
          )}
        </div>

        {/* RIGHT SIDE → TASK LIST */}
        <div className="space-y-3">
          {activityList.map((item) => {
            const done = activityData[item.key] === true;

            return (
              <div
                key={item.key}
                className={`flex justify-between items-center px-4 py-2 rounded-lg ${
                  done ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <span className="text-gray-700">{item.label}</span>

                <span
                  className={`font-semibold ${
                    done ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {done ? "✔" : "—"}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
}