function App() {
    const { Container, Row, Col, Button} = ReactBootstrap;
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <TodoListCard />
                </Col>
            </Row>
        </Container>
    );
}

function TodoListCard() {
    const [items, setItems] = React.useState(null);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setItems([...items, newItem]);
        },
        [items],
    );

    const onItemUpdate = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([
                ...items.slice(0, index),
                item,
                ...items.slice(index + 1),
            ]);
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([...items.slice(0, index), ...items.slice(index + 1)]);
        },
        [items],
    );

    const onDeleteAllItems = () => {
        fetch('/items', {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setItems([]);
            } else {
                console.error('Failed to delete all items');
            }
        })
        .catch(error => {
            console.error('Network error:', error);
        });
    };

    if (items === null) return 'Loading...';

    return (
        <React.Fragment>
            <div className='ToDoWrapper'>
                <div className='ToDoHeader'>
                    <h2 className="listHeading">T O D O</h2>
                </div>
                <AddItemForm onNewItem={onNewItem} />
                
                {items.length === 0 && (
                    <p className="text-center">No Tasks yet! Add one above!</p>
                )}
                {items.map(item => (
                    <ItemDisplay
                        item={item}
                        key={item.id}
                        onItemUpdate={onItemUpdate}
                        onItemRemoval={onItemRemoval}
                    />
                ))}
                <button class="deleteButton-pushable" onClick={onDeleteAllItems}>
                    <span class="deleteButton-shadow"></span>
                    <span class="deleteButton-edge"></span>
                    <span class="deleteButton-front text">
                        Delete All
                    </span>
                </button>
            </div>
        </React.Fragment>
    );
}

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="What is the task today?"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : '+'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button, Form } = ReactBootstrap;
    const [editing, setEditing] = React.useState(false);
    const [editedName, setEditedName] = React.useState(item.name);

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item),
        );
    };

    const editItem = () => {
        setEditing(true);
    };

    const saveEdit = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: editedName,
                completed: item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(updatedItem => {
                onItemUpdate(updatedItem);
                setEditing(false);
            });
    };

    return (
        <Container fluid className={`item ${item.completed && 'completed'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        disabled
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed ? 'fa-check-square text-white fa-2x' : 'fa-square text-white fa-2x'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={8} className={`name ${editing ? 'editing' : ''}`}>
                    {editing ? (
                        <React.Fragment>
                            <Form.Control
                                type="text"
                                value={editedName}
                                onChange={e => setEditedName(e.target.value)}
                            />
                            <Button
                                size="sm"
                                variant="success"
                                onClick={saveEdit}
                                disabled
                                className="saveButton"
                            >
                                Save
                            </Button>
                        </React.Fragment>
                    ) : (
                        item.name
                    )}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={editItem}
                        aria-label="Edit Item"
                        disabled
                    >
                        <i className="fa fa-edit fa-2x" />
                    </Button>
                </Col>
                <Col>
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        disabled
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger fa-2x" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
