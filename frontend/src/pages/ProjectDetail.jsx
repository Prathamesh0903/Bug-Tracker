import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Alert, Spinner, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = await currentUser.getIdToken();
        const data = await getProjectById(id, token);
        setProject(data);
      } catch (err) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProject();
    }
  }, [id, currentUser]);

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
        <Button variant="secondary" onClick={() => navigate('/projectlist')}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Project not found</Alert>
        <Button variant="secondary" onClick={() => navigate('/projectlist')}>
          Back to Projects
        </Button>
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
        <nav className="nav flex-column p-3">
          <button 
            className="btn btn-link text-white text-start mb-2"
            onClick={() => navigate('/projectlist')}
          >
            My Projects
          </button>
          <button 
            className="btn btn-link text-white text-start mb-2"
            onClick={() => navigate('/create')}
          >
            Create Project
          </button>
          <button 
            className="btn btn-link text-white text-start mb-2" 
            onClick={logout}
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-secondary">
          <div className="container-fluid">
            <span className="navbar-brand">Bug Tracker</span>
            <div className="d-flex">
              <span className="navbar-text me-3">
                Welcome, {currentUser?.email || 'User'}
              </span>
              <button className="btn btn-outline-light" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <Container fluid className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>{project.title}</h1>
              <Badge bg="info" className="mb-2">
                {project.teamMembers.length} team members
              </Badge>
            </div>
            <div>
              <Button 
                variant="primary" 
                className="me-2"
                onClick={() => navigate(`/edit/${project._id}`)}
              >
                Edit Project
              </Button>
              <Button 
                variant="success"
                onClick={() => navigate(`/projects/${project._id}/tickets`)}
              >
                View Tickets
              </Button>
            </div>
          </div>

          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Project Details</Card.Title>
                  <Card.Text>
                    {project.description || 'No description available.'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Quick Actions</Card.Title>
                  <Button 
                    variant="primary" 
                    className="w-100 mb-2"
                    onClick={() => navigate(`/projects/${project._id}/tickets/create`)}
                  >
                    Create New Ticket
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    className="w-100"
                    onClick={() => navigate('/projectlist')}
                  >
                    Back to All Projects
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Card>
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between align-items-center">
                    Team Members
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate(`/edit/${project._id}`)}
                    >
                      Manage Team
                    </Button>
                  </Card.Title>
                  {project.teamMembers.length > 0 ? (
                    <ListGroup variant="flush">
                      {project.teamMembers.map((member, index) => (
                        <ListGroup.Item key={index}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{member}</span>
                            <Badge bg="light" text="dark">
                              Member
                            </Badge>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Alert variant="info">No team members added yet.</Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Project Stats</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <span>Created</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default ProjectDetail;