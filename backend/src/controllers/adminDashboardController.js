const Project = require("../models/Project");
const Enquiry = require("../models/Enquiry");

// Get dashboard statistics.
const getDashboardStats = async (req, res) => {
    try {
        const [
            totalProjects,
            activeProjects,
            completedProjects,
            totalEnquiries,
            recentEnquiries,
        ] = await Promise.all([
            Project.countDocuments(),
            Project.countDocuments({ status: "In Progress" }),
            Project.countDocuments({ status: "Completed" }),
            Enquiry.countDocuments(),
            Enquiry.countDocuments({ status: "New" }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalProjects,
                activeProjects,
                completedProjects,
                totalEnquiries,
                newEnquiries: recentEnquiries,
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch dashboard statistics.",
        });
    }
};

// Get recently created projects.
const getRecentProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return res.status(200).json({
            success: true,
            data: projects,
        });
    } catch (error) {
        console.error("Recent projects error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch recent projects.",
        });
    }
};

// Get recently received enquiries.
const getRecentEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return res.status(200).json({
            success: true,
            data: enquiries,
        });
    } catch (error) {
        console.error("Recent enquiries error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch recent enquiries.",
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentProjects,
    getRecentEnquiries,
};