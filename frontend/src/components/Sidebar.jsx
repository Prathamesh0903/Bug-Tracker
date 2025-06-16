import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = await currentUser.getIdToken();
        const data = await getProjects(token);
        setProjects(data);
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

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const token = await currentUser.getIdToken();
      await deleteProject(id, token);
      setProjects(projects.filter(project => project._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="flex-grow-1 ms-3" style={{ marginLeft: '220px', padding: '20px' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>My Projects</h1>
            <div>
              <Button variant="primary" onClick={() => navigate('/create')} className="me-2">
                Create New Project
              </Button>
              <Button variant="outline-danger" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center mt-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger">
              {error}
              <div className="mt-3">
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </Alert>
          ) : projects.length === 0 ? (
            <Alert variant="info">No projects found. Create your first project!</Alert>
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
                {projects.map(project => (
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
