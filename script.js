const connectDB = require("./Database/connect");
const Projects = require("./Database/model/Projects");

(async () => {
  try {
    await connectDB();

    const result = await Projects.updateMany(
      { platform: "cdo" },
      {
        $set: {
          "optimalViewSize.enabled": true,
          "optimalViewSize.width": 1,
          "optimalViewSize.height": 1,
          "optimalViewSize.mode": "ratio"
        }
      }
    );

    console.log(`Updated ${result.modifiedCount ?? result.nModified ?? 0} CDO projects.`);
    console.log("All CDO projects now use a 1x1 ratio optimal view size.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await Projects.db?.close().catch(() => {});
  }
})();
