import { Card, CardHeader, CardBody, Heading, SimpleGrid, Text, Box } from '@chakra-ui/react';
import { FaUsers, FaShoppingCart, FaFileAlt } from 'react-icons/fa';

export default function ActiveListDashBoard() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={6}>
      <SimpleGrid 
        spacing={8} 
        templateColumns="repeat(auto-fill, minmax(200px, 1fr))" 
        maxWidth="800px" 
        width="80%"
      >
        <Card 
          border="1px solid" 
          borderColor="gray.300" 
          bg="gray.50" 
          p={4} 
          borderRadius="md" 
          _hover={{ boxShadow: 'lg' }}
        >
          <CardHeader display="flex" alignItems="center">
            <FaUsers size="40px" color="teal" />
            <Heading size="md" ml={3}>Active User</Heading>
          </CardHeader>
          <CardBody>
            <Heading size="lg" color="teal.600">4049</Heading>
          </CardBody>
        </Card>

        <Card 
          border="1px solid" 
          borderColor="gray.300" 
          bg="gray.50" 
          p={4} 
          borderRadius="md" 
          _hover={{ boxShadow: 'lg' }}
       
        >
          <CardHeader display="flex" alignItems="center">
            <FaShoppingCart size="40px" color="blue" />
            <Heading size="md" ml={3}>Active Customer</Heading>
          </CardHeader>
          <CardBody>
          <Heading size="lg" color="teal.600">5050</Heading>
          </CardBody>
        </Card>

        <Card 
          border="1px solid" 
          borderColor="gray.300" 
          bg="gray.50" 
          p={4} 
          borderRadius="md" 
          _hover={{ boxShadow: 'lg' }}
        >
          <CardHeader display="flex" alignItems="center">
            <FaFileAlt size="40px" color="purple" />
            <Heading size="md" ml={3}>Active Tender</Heading>
          </CardHeader>
          <CardBody>
          <Heading size="lg" color="teal.600">5151</Heading>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
