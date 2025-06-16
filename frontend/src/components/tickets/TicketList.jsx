import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicketsByProject, updateTicket } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Badge, Spinner, Container, Row, Col } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaPlus, FaUser, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

// Styles for the columns
const columnStyles = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '600px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 8px',
  flex: 1,
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  border: '1px solid #e9ecef',
};

const ticketStyles = {
  marginBottom: '12px',
  padding: '12px',
  backgroundColor: 'white',
  borderRadius: '6px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  transition: 'all 0.2s ease',
  ':hover': {
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  },
};

const priorityVariant = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

const statusVariant = {
  open: 'primary',
  'in-progress': 'info',
  resolved: 'success',
  closed: 'secondary',
};

const statusColumns = {
  'open': 'To Do',
  'in-progress': 'In Progress',
  'resolved': 'Done',
  'closed': 'Done'
};

const columnHeaderStyles = {
  padding: '10px',
  borderRadius: '6px',
  marginBottom: '16px',
  textAlign: 'center',
  color: 'white',
  fontWeight: '600',
};

const columnHeaderColors = {
  'To Do': '#6c757d',
  'In Progress': '#17a2b8',
  'Done': '#28a745',
};

const TicketList = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (!currentUser) return;
        
        const token = await currentUser.getIdToken();
        const data = await getTicketsByProject(projectId, token);
        setTickets(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch tickets');
        setLoading(false);
        console.error(err);
      }
    };

    fetchTickets();
  }, [projectId, currentUser]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const ticketToUpdate = tickets.find(ticket => ticket._id === draggableId);
    if (!ticketToUpdate) return;

    let newStatus;
    switch (destination.droppableId) {
      case 'To Do':
        newStatus = 'open';
        break;
      case 'In Progress':
        newStatus = 'in-progress';
        break;
      case 'Done':
        newStatus = 'resolved';
        break;
      default:
        newStatus = ticketToUpdate.status;
    }

    const updatedTickets = tickets.map(ticket => {
      if (ticket._id === draggableId) {
        return { ...ticket, status: newStatus };
      }
      return ticket;
    });
    setTickets(updatedTickets);

    try {
      setIsUpdating(true);
      const token = await currentUser.getIdToken();
      await updateTicket(ticketToUpdate._id, { status: newStatus }, token);
    } catch (err) {
      setError('Failed to update ticket status');
      setTickets(tickets);
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <div className="alert alert-danger d-flex align-items-center">
          <FaExclamationCircle className="me-2" />
          {error}
        </div>
      </Container>
    );
  }

  const groupedTickets = {
    'open': tickets.filter(ticket => ticket.status === 'open'),
    'in-progress': tickets.filter(ticket => ticket.status === 'in-progress'),
    'resolved': tickets.filter(ticket => ticket.status === 'resolved' || ticket.status === 'closed'),
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <strong>Project Tickets</strong>
            </h2>
            <Button 
              variant="primary" 
              onClick={() => navigate(`/projects/${projectId}/tickets/create`)}
              className="d-flex align-items-center"
            >
              <FaPlus className="me-2" />
              Create Ticket
            </Button>
          </div>
          <hr className="mt-3" />
        </Col>
      </Row>

      {isUpdating && (
        <div className="text-center mb-3">
          <Spinner animation="border" size="sm" variant="primary" />
          <span className="ms-2">Updating ticket...</span>
        </div>
      )}

      {tickets.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <FaCheckCircle size={48} className="text-muted mb-3" />
            <h5>No tickets found for this project</h5>
            <p className="text-muted">Create your first ticket to get started</p>
            <Button 
              variant="outline-primary" 
              onClick={() => navigate(`/projects/${projectId}/tickets/create`)}
            >
              Create Ticket
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', overflowX: 'auto', padding: '8px 0' }}>
            {Object.entries(groupedTickets).map(([status, ticketsInColumn]) => (
              <Droppable key={status} droppableId={statusColumns[status]}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ ...columnStyles, minWidth: '320px' }}
                  >
                    <div 
                      style={{ 
                        ...columnHeaderStyles, 
                        backgroundColor: columnHeaderColors[statusColumns[status]] 
                      }}
                    >
                      {statusColumns[status]} ({ticketsInColumn.length})
                    </div>
                    {ticketsInColumn.map((ticket, index) => (
                      <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...ticketStyles,
                              ...provided.draggableProps.style,
                              cursor: 'grab',
                            }}
                            onClick={() => navigate(`/projects/${projectId}/tickets/edit/${ticket._id}`)}
                            className="ticket-card"
                          >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0 fw-bold">{ticket.title}</h6>
                              <Badge 
                                bg={priorityVariant[ticket.priority]} 
                                className="text-uppercase"
                              >
                                {ticket.priority}
                              </Badge>
                            </div>
                            <p className="text-muted small mb-3">
                              {ticket.description.substring(0, 80)}...
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <Badge 
                                bg={statusVariant[ticket.status]} 
                                className="text-uppercase"
                              >
                                {ticket.status}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </Container>
  );
};

export default TicketList;