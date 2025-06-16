import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert, ButtonGroup, Navbar, Nav, Row, Col, Form, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/projectApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await currentUser.getIdToken();
        const data = await getProjects(token);
        setProjects(data);
        setFilteredProjects(data);
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.teamMembers.some(member => 
          member.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const token = await currentUser.getIdToken();
      await deleteProject(id, token);
      setProjects(projects.filter(project => project._id !== id));
      setFilteredProjects(filteredProjects.filter(project => project._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Container>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#495057', color: 'white' }}>
        <div className="p-3">
          <h4>Project Dashboard</h4>
        </div>
        <Nav className="flex-column p-3">
          <Dropdown as={Nav.Item} className="mb-2">
            <Dropdown.Toggle as={Nav.Link} className="text-white" style={{ cursor: 'pointer' }}>
              Project Selector
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {projects.map(project => (
                <Dropdown.Item 
                  key={project._id} 
                  as={Link} 
                  to={`/projects/${project._id}`}
                  className="text-dark"
                >
                  {project.title}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Nav.Link 
            as={Link} 
            to="/home" 
            className="text-white mb-2"
          >
            Home
          </Nav.Link>
          <Nav.Link 
            onClick={logout} 
            className="text-white mb-2"
          >
            Logout
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Navbar */}
        <Navbar bg="secondary" variant="dark" expand="lg">
          <Container fluid>
            <Navbar.Brand href="#home">Bug Tracker</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
              <Form className="d-flex me-3" style={{ width: '300px' }}>
                <Form.Control
                  type="search"
                  placeholder="Search projects..."
                  className="me-2"  
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-light">
                  Search
                </Button>
              </Form>
              <Nav>
                <Navbar.Text className="me-3">
                  Welcome, {currentUser?.email || 'User'}
                </Navbar.Text>
                <Button variant="outline-light" onClick={logout}>
                  Logout
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Page Content */}
        <Container fluid className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>My Projects</h1>
            <Button variant="primary" onClick={() => navigate('/create')}>
              Create New Project
            </Button>
          </div>
          
          {filteredProjects.length === 0 ? (
            <Alert variant="info">
              {searchTerm.trim() === '' 
                ? 'No projects found. Create your first project!' 
                : 'No projects match your search criteria.'}
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Team Members</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(project => (
                  <tr key={project._id}>
                    <td>{project.title}</td>
                    <td>{project.description || '-'}</td>
                    <td>
                      {project.teamMembers.length > 0 ? (
                        <ul className="list-unstyled mb-0">
                          {project.teamMembers.map((member, index) => (
                            <li key={index}>{member}</li>
                          ))}
                        </ul>
                      ) : '-'}
                    </td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button 
                          variant="info"
                          onClick={() => navigate(`/edit/${project._id}`)}>
                          Edit
                        </Button>
                        <Button 
                          variant="success"
                          onClick={() => navigate(`/projects/${project._id}`)}>
                          View
                        </Button>
                        <Button 
                          variant="primary"
                          onClick={() => navigate(`/projects/${project._id}/tickets`)}>
                          Tickets
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => handleDelete(project._id)}
                          disabled={deletingId === project._id}
                        >
                          {deletingId === project._id ? (
                            <Spinner as="span" size="sm" animation="border" role="status" />
                          ) : 'Delete'}
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Container>
      </div>
    </div>
  );
};

export default ProjectList;