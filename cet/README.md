# ICT Project Cost Estimation Tool

A comprehensive web-based tool for creating detailed cost estimates for ICT (Information and Communication Technology) projects. This tool provides a professional, multi-tab interface for managing all aspects of project cost estimation including resources, vendors, tools, risks, and contingencies.

## 🚀 Live Demo

**GitHub Pages URL:** (https://james-j-walshe.github.io/cost_estimation/)

**Raw File URLs:**
- HTML: `https://raw.githubusercontent.com/James-J-Walshe/cost_estimation/main/index.html`
- CSS: `https://raw.githubusercontent.com/James-J-Walshe/cost_estimation/main/style.css`
- script.js: `https://raw.githubusercontent.com/James-J-Walshe/cost_estimation/main/script.js`
- data_manager.js: `https://raw.githubusercontent.com/James-J-Walshe/cost_estimation/refs/heads/main/js/data_manager.js`
- dom_manager.js: `https://raw.githubusercontent.com/James-J-Walshe/cost_estimation/refs/heads/main/js/dom_manager.js`
- table_renderer.js: `https://raw.githubusercontent.com/James-J-Walshe/cost_estimation/refs/heads/main/js/table_renderer.js`

## 📋 Features

### Multi-Tab Interface
- **Project Information** - Basic project details and description
- **Resource Plan** - Overview with cost summary cards and quarterly forecasting
- **Internal Resources** - Manage internal team members with role-based daily rates
- **Vendor Costs** - Track external vendor costs across quarters
- **Tool Costs** - Software and tool licensing costs with duration calculations
- **Miscellaneous** - Other project costs (travel, equipment, training, etc.)
- **Risks & Contingency** - Risk management with automatic contingency calculations
- **Rate Cards** - Manage internal and external daily rates for different roles
- **Summary** - Complete cost breakdown and project totals

### Key Capabilities
- ✅ **Real-time calculations** - Automatic cost updates as you enter data
- ✅ **Monthly forecasting** - Plan costs across multiple months
- ✅ **Data persistence** - Automatically saves your work locally
- ✅ **Export functionality** - Export estimates to CSV format
- ✅ **Import/Export projects** - Save and load projects as JSON files
- ✅ **Responsive design** - Works on desktop, tablet, and mobile devices
- ✅ **Professional styling** - Clean, modern interface with intuitive navigation

### Built-in Rate Cards
- Pre-populated with common ICT roles and rates
- Separate internal and external rate structures
- Easily customizable and expandable
- Automatic rate application to resource calculations

## 🛠️ Technology Stack

- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with flexbox and grid layouts
- **Vanilla JavaScript** - No external dependencies
- **Local Storage** - Browser-based data persistence
- **Responsive Design** - Mobile-first approach

## 📁 File Structure

```
ict-cost-estimator/
├── index.html          # Main HTML structure
├── style.css           # All styling and responsive design
├── script.js           # Application logic and functionality
└── README.md           # This documentation file
```

## 🚦 Getting Started

### Option 1: Use GitHub Pages (Recommended)
1. Visit the live demo URL above
2. Start creating your cost estimate immediately
3. No installation required!

### Option 2: Local Development
1. Clone this repository:
   ```bash
   git clone https://github.com/James-J-Walshe/cost_estimation.git
   ```
2. Navigate to the project directory:
   ```bash
   cd cost_estimation
   ```
3. Open `index.html` in your web browser
4. Start using the cost estimation tool

### Option 3: Download Raw Files
Download the individual files using the raw URLs above and save them in the same directory.

## 📖 Usage Guide

### Creating a New Estimate
1. **Start with Project Info** - Enter basic project details
2. **Set up Rate Cards** - Customize daily rates for different roles
3. **Add Internal Resources** - Plan your internal team allocation
4. **Include Vendor Costs** - Add external contractor and vendor expenses
5. **Account for Tools** - Include software licensing and tool costs
6. **Add Miscellaneous** - Include travel, equipment, and other costs
7. **Manage Risks** - Document risks and set contingency percentage
8. **Review Summary** - Get complete cost breakdown and totals

### Data Management
- **Auto-save**: Your work is automatically saved to browser storage
- **Manual Save**: Use the "Save Project" button for additional backup
- **Export**: Download your estimate as a CSV file for Excel
- **Load**: Import previously saved projects from JSON files

### Cost Calculations
- **Quarterly Breakdown**: Costs are tracked across quarters for better cash flow planning
- **Automatic Totals**: All calculations update in real-time
- **Contingency**: Set percentage-based contingency for risk management
- **Summary View**: Complete project cost overview with detailed breakdown

## 🎨 Customization

### Rate Cards
- Modify default rates in the Rate Cards tab
- Add new roles specific to your organization
- Set different rates for internal vs external resources

### Categories
- Vendor categories: Implementation, Consulting, Training, Support, Other
- Tool license types: Per User, Per Device, Enterprise, One-time
- Miscellaneous categories: Travel, Equipment, Training, Documentation, Other

### Styling
- Edit `style.css` to customize colors, fonts, and layout
- Responsive breakpoints can be adjusted for different screen sizes
- CSS variables make theme customization straightforward

## 🔧 Technical Details

### Browser Compatibility
- Chrome 70+ ✅
- Firefox 65+ ✅
- Safari 12+ ✅
- Edge 79+ ✅

### Data Storage
- Uses browser's localStorage for data persistence
- Gracefully handles storage unavailability
- No server required - fully client-side application

### Performance
- Lightweight - no external dependencies
- Fast loading and responsive interface
- Efficient DOM manipulation and event handling

## 📊 Export Formats

### CSV Export
Includes all project data:
- Project information and metadata
- Internal resources with quarterly breakdown
- Vendor costs and categories
- Tool licensing costs
- Miscellaneous expenses
- Risk assessments
- Complete cost summary

### JSON Project Files
- Full project data for backup/restore
- Compatible across different browsers
- Human-readable format for data portability

## 🤝 Contributing

This is a standalone tool designed for immediate use. If you'd like to enhance it:

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Test thoroughly across browsers
5. Submit a pull request

### Potential Enhancements
- [ ] Multi-currency support
- [ ] Advanced reporting and charts
- [ ] Template library for common project types
- [ ] Collaborative editing features
- [ ] Integration with project management tools
- [ ] Advanced risk assessment models

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

### Troubleshooting
- **Blank page**: Check browser console (F12) for JavaScript errors
- **Data not saving**: Ensure browser allows localStorage
- **Layout issues**: Try refreshing the page or clearing browser cache

### Common Issues
1. **JavaScript disabled**: Enable JavaScript in your browser
2. **Old browser**: Use a modern browser (see compatibility above)
3. **File access**: When running locally, use a local server or enable file:// access

## 🔄 Updates

This tool is actively maintained. Check back for:
- Bug fixes and performance improvements
- New features and enhancements
- Additional export formats
- Enhanced mobile experience

## 📞 Contact

For questions, suggestions, or issues:
- Create an issue in this GitHub repository
- Use the GitHub Discussions feature
- Fork and submit improvements via pull request

---

**Built with ❤️ for project managers and cost estimators**

*This tool was designed to replace complex Excel-based cost estimation workflows with a modern, user-friendly web application.*
