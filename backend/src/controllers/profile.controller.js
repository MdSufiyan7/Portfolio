
const Profile = require("../models/Profile");
const {
  profileUpdateSchema,
} = require("../validators/profile.validator");

async function getOrCreateProfile() {
  let profile = await Profile.findById("main").lean();

  if (profile) return profile;

  try {
    await Profile.create({ _id: "main" });
  } catch (error) {
    // Another request may have created it first.
    if (error.code !== 11000) throw error;
  }

  return Profile.findById("main").lean();
}

exports.getPublicProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile();

    res.set("Cache-Control", "no-store");

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAdminProfile = async (req, res, next) => {
  try {
    const profile = await getOrCreateProfile();

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  const parsed = profileUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid profile data",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const profile = await Profile.findByIdAndUpdate(
      "main",
      { $set: parsed.data },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    ).lean();

    return res.json({
      success: true,
      data: profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return next(error);
  }
};
