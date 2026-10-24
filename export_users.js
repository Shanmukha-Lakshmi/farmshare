const db = require('./db');
const fs = require('fs');

db.serialize(() => {
    db.all('SELECT * FROM users', [], (err, users) => {
        if (err) return console.error('Error querying users:', err);
        
        db.all('SELECT * FROM equipment', [], (err2, equipment) => {
            if (err2) return console.error('Error querying equipment:', err2);
            
            db.all('SELECT * FROM bookings', [], (err3, bookings) => {
                if (err3) return console.error('Error querying bookings:', err3);

                // 1. Save JSON File
                const fullUserData = users.map(user => {
                    const userEquipment = equipment.filter(e => e.owner === user.name || (user.name === 'Ramesh Kumar' && e.owner === 'Self'));
                    const userRentals = bookings.filter(b => b.renterName === user.name);
                    const userLendings = bookings.filter(b => b.machineOwner === user.name || (user.name === 'Ramesh Kumar' && (b.machineOwner === 'Self' || !b.machineOwner)));
                    return {
                        profile: user,
                        ownedEquipment: userEquipment,
                        rentalsAsRenter: userRentals,
                        incomingBookingRequestsAsLender: userLendings
                    };
                });
                fs.writeFileSync('users_data.json', JSON.stringify(fullUserData, null, 2));
                console.log('✅ Exported users_data.json');

                // 2. Save Markdown File
                let md = `# 🌾 FARMSHARE User Accounts & Database Export\n\n`;
                md += `**Export Timestamp**: ${new Date().toLocaleString()}\n\n`;

                users.forEach((user) => {
                    md += `## 👤 User #${user.id}: ${user.name}\n`;
                    md += `- **Phone Number**: ${user.phone}\n`;
                    md += `- **Aadhaar UID (Verified E-KYC)**: ${user.aadhaar}\n`;
                    md += `- **Village / Region**: ${user.village}\n`;
                    md += `- **Preferred Language**: ${user.language}\n`;
                    md += `- **Account Created**: ${user.created_at}\n\n`;

                    const myEquip = equipment.filter(e => e.owner === user.name || (user.name === 'Ramesh Kumar' && e.owner === 'Self'));
                    md += `### 🚜 Listed Fleet (${myEquip.length} items)\n`;
                    if (myEquip.length === 0) {
                        md += `*No machinery listed yet.*\n\n`;
                    } else {
                        myEquip.forEach(e => {
                            md += `- **${e.name}** (${e.type}) | Rate: ₹${e.rate}/hr | Location: ${e.location} (${e.dist})\n`;
                        });
                        md += '\n';
                    }

                    const myBookings = bookings.filter(b => b.renterName === user.name);
                    md += `### 🛒 Rental Bookings as Renter (${myBookings.length} bookings)\n`;
                    if (myBookings.length === 0) {
                        md += `*No rental bookings placed.*\n\n`;
                    } else {
                        myBookings.forEach(b => {
                            md += `- Booking #${b.id}: **${b.machineName}** (${b.hours} hrs) | Payout: ₹${b.payout} | PIN: \`${b.pin}\` | Status: ${b.status}\n`;
                        });
                        md += '\n';
                    }

                    const myLendings = bookings.filter(b => b.machineOwner === user.name || (user.name === 'Ramesh Kumar' && (b.machineOwner === 'Self' || !b.machineOwner)));
                    md += `### 📥 Incoming Requests Received as Lender (${myLendings.length} requests)\n`;
                    if (myLendings.length === 0) {
                        md += `*No incoming booking requests received.*\n\n`;
                    } else {
                        myLendings.forEach(b => {
                            md += `- Request #${b.id} from **${b.renterName}** (${b.village}): **${b.machineName}** (${b.hours} hrs) | Payout: ₹${b.payout} | Status: ${b.status}\n`;
                        });
                        md += '\n';
                    }
                    md += `---\n\n`;
                });

                fs.writeFileSync('users_data.md', md);
                console.log('✅ Exported users_data.md');
            });
        });
    });
});
