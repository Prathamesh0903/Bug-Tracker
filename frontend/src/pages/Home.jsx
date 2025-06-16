import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Nav, Navbar, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProjects } from '../api/projectApi';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await currentUser.getIdToken();
        const data = await getProjects(token);
        // Get only the first 3 projects for the home page
        setProjects(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProjects();
    }
  }, [currentUser]);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#495057', color: 'white' }}>
        <div className="p-3">
          <h4>Project Dashboard</h4>
        </div>
        <Nav className="flex-column p-3">
          <Nav.Link as={Link} to="/projectlist" className="text-white mb-2">
            My Projects
          </Nav.Link>
          <Nav.Link as={Link} to="/create" className="text-white mb-2">
            Create Project
          </Nav.Link>
          <Nav.Link onClick={logout} className="text-white mb-2">
            Logout
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Navbar */}
        <Navbar bg="secondary" variant="dark" expand="lg">
          <Container fluid>
            <Navbar.Brand>Bug Tracker</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
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
          <div className="text-center mb-5">
            <h1 className="display-4">Welcome to Bug Tracker</h1>
            <p className="lead">Manage your projects and track bugs efficiently</p>
          </div>

          {/* Recent Projects Section */}
          <Row className="mb-5">
            <Col>
              <h2 className="mb-4">Your Recent Projects</h2>
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : projects.length > 0 ? (
                <Row>
                  {projects.map((project) => (
                    <Col md={4} key={project._id} className="mb-4">
                      <Card className="h-100 shadow-sm">
                        <Card.Body>
                          <Card.Title className="d-flex justify-content-between align-items-center">
                            {project.title}
                            <Badge bg="info" pill>
                              {project.teamMembers.length} members
                            </Badge>
                          </Card.Title>
                          <Card.Text className="text-muted">
                            {project.description?.substring(0, 100) || 'No description available'}
                            {project.description?.length > 100 && '...'}
                          </Card.Text>
                          <Button 
                            variant="outline-primary" 
                            onClick={() => navigate(`/projects/${project._id}`)}
                            size="sm"
                          >
                            View Details
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Card className="text-center p-4">
                  <Card.Text>No projects found. Create your first project!</Card.Text>
                  <Button variant="success" onClick={() => navigate('/create')}>
                    Create Project
                  </Button>
                </Card>
              )}
              <div className="text-center mt-3">
                <Button variant="primary" onClick={() => navigate('/projectlist')}>
                  View All Projects
                </Button>
              </div>
            </Col>
          </Row>

          {/* Features Section */}
          <Row className="justify-content-center mb-5">
            <Col md={8}>
              <h2 className="text-center mb-4">Key Features</h2>
              <Row>
                <Col md={4}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Body className="text-center">
                      <div className="mb-3">
                        <i className="bi bi-kanban-fill fs-1 text-primary"></i>
                      </div>
                      <Card.Title>Project Management</Card.Title>
                      <Card.Text>
                        Organize your work into projects with team members and deadlines.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Body className="text-center">
                      <div className="mb-3">
                        <i className="bi bi-bug-fill fs-1 text-danger"></i>
                      </div>
                      <Card.Title>Bug Tracking</Card.Title>
                      <Card.Text>
                        Track and resolve bugs efficiently with detailed reports.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Body className="text-center">
                      <div className="mb-3">
                        <i className="bi bi-people-fill fs-1 text-success"></i>
                      </div>
                      <Card.Title>Team Collaboration</Card.Title>
                      <Card.Text>
                        Work together with your team in real-time.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Call to Action */}
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <Card className="bg-light">
                <Card.Body>
                  <h3>Ready to get started?</h3>
                  <p className="mb-4">Create your first project or explore existing ones</p>
                  <div className="d-flex justify-content-center gap-3">
                    <Button variant="primary" size="lg" onClick={() => navigate('/projectlist')}>
                      View All Projects
                    </Button>
                    <Button variant="success" size="lg" onClick={() => navigate('/create')}>
                      Create New Project
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Home;