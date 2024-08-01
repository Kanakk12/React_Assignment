import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component"; //infinite-scroll
import "./EmployeeList.css"; //styles
import { FaFilter } from "react-icons/fa"; //react-icons

// List of available countries for filtering
const countriesList = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "India",
  "China",
  "Japan",
  "Brazil",
  "Mexico",
];

const App = () => {

  // State variables for managing employees data, pagination, and filters
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({ country: "", gender: "" });
  const [loading, setLoading] = useState(false);


  // Here, Function to fetch employee data from the API
  const fetchEmployees = useCallback(async () => {
    if (loading) return; // Prevent fetching if already loading
    setLoading(true);

    try {
      // Fetch employee data with pagination
      const response = await axios.get("https://dummyjson.com/users", {
        params: {
          limit: 10,
          skip: page * 10,
          select: "id,firstName,lastName,age,gender,company,address,image",
        },
      });

      console.log("Fetched data:", response.data.users);

      // Transform and map fetched data
      const fetchedEmployees = response.data.users.map((user) => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        demography: `${user.gender === "male" ? "M" : "F"}/${user.age}`,
        designation: user.company.title,
        location: `${user.address.city}, ${user.address.state}`,
        country: user.address.country,
      }));

      // Apply filters to new data before appending
      const filteredNewData = fetchedEmployees.filter((employee) => {
        const matchesCountry = filters.country === "" || employee.country === filters.country;
        const matchesGender = filters.gender === "" || employee.gender === filters.gender;
        return matchesCountry && matchesGender;
      });

      // Update employees state with filtered new data
      setEmployees((prevEmployees) => {
        if (page === 0) return filteredNewData;
        return [...prevEmployees, ...filteredNewData];
      });

      // Now, Check if more data is available for pagination
      setHasMore(response.data.users.length > 0);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, filters]);

  // Fetch employees initially and whenever filters change
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);


  // Reset pagination and employees list when filters change
  useEffect(() => {
    setPage(0); // Reset page number
    setEmployees([]); // Clear current employees
    setHasMore(true); // Reset the 'has more' flag
  }, [filters]);


  // Handler for sorting employees by selected field
  const handleSort = (field) => {
    setSortField(field);
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  // Handler for updating filters state
  const handleFilterChange = (filterType, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterType]: value }));
  };

  // Filter and sort employees based on current filters and sorting order
  const filteredAndSortedEmployees = employees
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="employee-list">
      <header>
        <h1>Employees</h1>
      </header>
      <div className="filters">
        <FaFilter className="icon" />
        
        {/* Dropdown for selecting country filter */}
        <select
          className="country"
          onChange={(e) => handleFilterChange("country", e.target.value)}
          value={filters.country}
        >
          <option value="">Country</option>
          {countriesList.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        {/* Dropdown for selecting gender filter */}
        <select
          className="gender"
          onChange={(e) => handleFilterChange("gender", e.target.value)}
          value={filters.gender}
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Infinite scroll component */}
      <InfiniteScroll
        dataLength={filteredAndSortedEmployees.length}
        next={() => {
          if (hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        }}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more records to load</p>}
      >
        {/* Employee data table */}
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("id")}>
                ID {sortField === "id" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Image</th>
              <th onClick={() => handleSort("fullName")}>
                Full Name{" "}
                {sortField === "fullName" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleSort("age")}>
                Demography{" "}
                {sortField === "age" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th>Designation</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEmployees.map((employee, index) => (
              <tr key={`${employee.id}-${page}-${index}`}>
                <td>{employee.id}</td>
                <td>
                  <img
                    src={employee.image}
                    alt={employee.fullName}
                    className="employee-image"
                  />
                </td>
                <td>{employee.fullName}</td>
                <td>{employee.demography}</td>
                <td>{employee.designation}</td>
                <td>{employee.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
};

export default App;























  


