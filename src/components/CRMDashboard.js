import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Input,
  Select,
  Grid,
  GridItem,
  useColorModeValue,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { FaUsers, FaChartLine, FaCalendarAlt, FaEnvelope, FaEdit, FaTrash } from 'react-icons/fa';

const CRMDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      lastContact: '2024-03-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'inactive',
      lastContact: '2024-03-10',
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      status: 'active',
      lastContact: '2024-03-14',
    },
  ]);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', status: 'active' });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  // Modal controls
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  // Alert dialog ref
  const cancelRef = React.useRef();

  // Mock data for demonstration
  const stats = [
    { label: 'Total Customers', value: customers.length.toString(), change: '+12%', icon: FaUsers },
    { label: 'Active Campaigns', value: '45', change: '+5%', icon: FaChartLine },
    { label: 'Upcoming Events', value: '8', change: '-2%', icon: FaCalendarAlt },
    { label: 'Unread Messages', value: '23', change: '+8%', icon: FaEnvelope },
  ];

  // Filter customers based on search query and status filter
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle adding a new customer
  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        title: 'Error',
        description: 'Name and email are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newId = Math.max(...customers.map(c => c.id), 0) + 1;
    const today = new Date().toISOString().split('T')[0];

    const customerToAdd = {
      ...newCustomer,
      id: newId,
      lastContact: today,
    };

    setCustomers([...customers, customerToAdd]);
    setNewCustomer({ name: '', email: '', status: 'active' });
    onAddClose();

    toast({
      title: 'Customer added',
      description: `${customerToAdd.name} has been added to your customer list.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle editing a customer
  const handleEditCustomer = () => {
    if (!editingCustomer.name || !editingCustomer.email) {
      toast({
        title: 'Error',
        description: 'Name and email are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCustomers(customers.map(c => (c.id === editingCustomer.id ? editingCustomer : c)));

    onEditClose();

    toast({
      title: 'Customer updated',
      description: `${editingCustomer.name}'s information has been updated.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle deleting a customer
  const handleDeleteCustomer = () => {
    if (!customerToDelete) return;

    setCustomers(customers.filter(c => c.id !== customerToDelete.id));
    setCustomerToDelete(null);
    onDeleteClose();

    toast({
      title: 'Customer deleted',
      description: `${customerToDelete.name} has been removed from your customer list.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Open edit modal for a customer
  const openEditModal = customer => {
    setEditingCustomer({ ...customer });
    onEditOpen();
  };

  // Open delete confirmation for a customer
  const openDeleteModal = customer => {
    setCustomerToDelete(customer);
    onDeleteOpen();
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">CRM Dashboard</Heading>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          {stats.map((stat, index) => (
            <GridItem key={index}>
              <Box p={5} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                <Stat>
                  <StatLabel>
                    <HStack spacing={2}>
                      <Icon as={stat.icon} />
                      <Text>{stat.label}</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber>{stat.value}</StatNumber>
                  <StatHelpText>
                    <StatArrow type={stat.change.startsWith('+') ? 'increase' : 'decrease'} />
                    {stat.change}
                  </StatHelpText>
                </Stat>
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* Search and Filter */}
        <HStack spacing={4}>
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            maxW="300px"
          />
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} maxW="200px">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button colorScheme="blue" onClick={onAddOpen}>
            Add Customer
          </Button>
        </HStack>

        {/* Customers Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Last Contact</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCustomers.map(customer => (
                <Tr key={customer.id}>
                  <Td>{customer.name}</Td>
                  <Td>{customer.email}</Td>
                  <Td>
                    <Badge colorScheme={customer.status === 'active' ? 'green' : 'gray'}>
                      {customer.status}
                    </Badge>
                  </Td>
                  <Td>{customer.lastContact}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<FaEdit />}
                        onClick={() => openEditModal(customer)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        leftIcon={<FaTrash />}
                        onClick={() => openDeleteModal(customer)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Add Customer Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Customer name"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  placeholder="customer@example.com"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  value={newCustomer.status}
                  onChange={e => setNewCustomer({ ...newCustomer, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddCustomer}>
              Add
            </Button>
            <Button variant="ghost" onClick={onAddClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingCustomer && (
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Customer name"
                    value={editingCustomer.name}
                    onChange={e => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    placeholder="customer@example.com"
                    value={editingCustomer.email}
                    onChange={e =>
                      setEditingCustomer({ ...editingCustomer, email: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={editingCustomer.status}
                    onChange={e =>
                      setEditingCustomer({ ...editingCustomer, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditCustomer}>
              Save
            </Button>
            <Button variant="ghost" onClick={onEditClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Customer
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {customerToDelete?.name}? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteCustomer} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CRMDashboard;
