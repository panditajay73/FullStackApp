import React, { useEffect, useState } from "react";

export default function ApprovePM() {
    const [managers, setManagers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showApproved, setShowApproved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            const response = await fetch("https://localhost:7152/api/auth/project-managers");
            const data = await response.json();
            setManagers(data);
        } catch (error) {
            console.error("Error fetching managers:", error);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pmId => pmId !== id) : [...prev, id]
        );
    };

    const updateSelected = async () => {
        if (selectedIds.length === 0) return;
        setLoading(true); // Show "Updating..." on button

        await Promise.all(selectedIds.map(async (id) => {
            await fetch(`https://localhost:7152/api/auth/toggle-approval/${id}`, { method: "POST" });
        }));

        setSelectedIds([]); // Clear selected checkboxes
        await fetchManagers(); // Refresh grid only
        setLoading(false); // Hide "Updating..." text
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Approve Project Managers</h2>

            {/* Toggle View Buttons */}
            <div style={styles.buttonContainer}>
                <button
                    style={showApproved ? styles.toggleButton : styles.activeButton}
                    onClick={() => setShowApproved(false)}
                >
                    Not Approved
                </button>
                <button
                    style={!showApproved ? styles.toggleButton : styles.activeButton}
                    onClick={() => setShowApproved(true)}
                >
                    Approved
                </button>
            </div>

            {/* Table */}
            <div style={styles.tableContainer}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
    <thead>
        <tr style={{ backgroundColor: "#11232b", color: "white" }}>
            <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>Select</th>
            <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>Username</th>
            <th style={{ padding: "10px", border: "1px solid #ccc", textAlign: "center" }}>Email</th>
        </tr>
    </thead>
    <tbody>
        {managers
            .filter(pm => pm.isApproved === showApproved)
            .map(pm => (
                <tr key={pm.id}>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(pm.id)}
                            onChange={() => handleCheckboxChange(pm.id)}
                        />
                    </td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{pm.username}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{pm.email}</td>
                </tr>
            ))}
    </tbody>
</table>

            </div>

            {/* Update Selected Button */}
            <button
                style={styles.updateButton}
                onClick={updateSelected}
                disabled={selectedIds.length === 0 || loading}
            >
                {loading ? "Updating..." : "Update"}
            </button>
        </div>
    );
}

// Styles (Modern & Amazing)
const styles = {
    container: {
        padding: "20px",
        fontFamily: "'Poppins', sans-serif",
        textAlign: "center",
        backgroundColor: "#31464d",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        maxWidth: "800px",
        margin: "auto",
    },
    heading: {
        marginBottom: "20px",
        color: "#fff",
    },
    buttonContainer: {
        marginBottom: "20px",
    },
    toggleButton: {
        padding: "10px 20px",
        margin: "5px",
        backgroundColor: "#ddd",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background 0.3s",
    },
    activeButton: {
        padding: "10px 20px",
        margin: "5px",
        backgroundColor: "#007BFF",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background 0.3s",
    },
    tableContainer: {
        overflowX: "auto",
        borderRadius: "10px",
        
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "#31464d",
        
        overflow: "hidden",
    },
    tableHeader: {
        backgroundColor: "#007BFF",
        color: "white",
        textAlign: "left",
        
    },
    tableRow: {
        borderBottom: "1px solid #ddd",
        transition: "background 0.3s",
    },
    tableRowHover: {
        backgroundColor: "#f1f1f1",
    },
    updateButton: {
        marginTop: "20px",
        padding: "12px 18px",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background 0.3s",
    },
};


