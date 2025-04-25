import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  Spacer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Tooltip,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Divider,
  List,
  ListItem,
  ListIcon,
  Flex,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
  Wrap,
  WrapItem,
  Center,
  Square,
  Circle,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Kbd,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  useToast,
} from '@chakra-ui/react';
import {
  FaStar,
  FaGoogle,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaAt,
  FaGlobe,
  FaLinkedin,
  FaThumbsUp,
  FaThumbsDown,
  FaReply,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaComments,
  FaUserFriends,
  FaRegSmile,
  FaRegFrown,
  FaRegMeh,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaLightbulb,
  FaRobot,
  FaBrain,
  FaChartNetwork,
  FaTags,
  FaFilter,
  FaSync,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa';

const CompetitorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [competitors, setCompetitors] = useState([
    {
      id: 1,
      name: 'VidTech, Inc.',
      location: 'Thousand Oaks, CA',
      address: '3717 E Thousand Oaks Blvd, Thousand Oaks, CA 91362',
      phone: '(805) 372-2462',
      website: 'vidtech.com',
      linkedin: 'https://www.linkedin.com/company/vidtech/',
      rating: 4.9,
      reviewCount: 36,
      status: 'active',
      notes:
        'Global provider of commercial real estate marketing video solutions, including video inspections.',
      reviews: [
        {
          id: 1,
          reviewer: 'Morgan Dunn',
          rating: 5,
          date: '2 months ago',
          text: 'The VidTech team is ultra dialed in to the needs of their customers and helped us perfectly curate a 10-building portfolio that is on the market for sale to give investors an inside look to the offering. The team was professional to work with.',
          response:
            "Thank you so much for your thoughtful review, Morgan! Your kind words mean a lot to us—we loved working with you too! We're thrilled that the video captured your vision and showcased your portfolio in a way that resonates with investors. We truly appreciate your recommendation and look forward to working together again!",
          responseDate: '2 months ago',
        },
        {
          id: 2,
          reviewer: 'Richard Ortiz',
          rating: 5,
          date: '4 months ago',
          text: "It's always a pleasure doing business with VidTech! Shanda, Olivia, and Zack are fantastic to work with and make it a breeze from beginning to end, with plenty of support along the way.",
          response:
            'Thank you Richard! We truly appreciate your kind words and love working with you too. Our team is always here to make the process seamless and supportive from start to finish. Looking forward to the next project!',
          responseDate: '2 months ago',
        },
        {
          id: 3,
          reviewer: "Bird's Eye View Drone & Marketing Services",
          rating: 5,
          date: '6 months ago',
          text: 'Working with Olivia at VidTech was an absolute pleasure! She is very sweet and professional. She was always available for questions and her communication throughout made the project go smoothly from start to finish. I look forward to working with VidTech again in the future.',
          response:
            "Thank you so much for your kind words! We're thrilled to hear that your experience with Olivia and the VidTech team was a positive one. We strive to ensure that every project runs smoothly, and it's wonderful to know that Olivia's communication and professionalism made a difference. We're looking forward to working with you again in the future and continuing to provide excellent service! ~ The VidTech Team",
          responseDate: '6 months ago',
        },
        {
          id: 4,
          reviewer: 'Sarah Johnson',
          rating: 5,
          date: '8 months ago',
          text: 'VidTech has been instrumental in helping us showcase our properties. Their attention to detail and high-quality videos have made a significant difference in our marketing efforts.',
          response:
            "Thank you, Sarah! We're glad our services have been helpful for your marketing efforts. We look forward to continuing to support your business.",
          responseDate: '8 months ago',
        },
        {
          id: 5,
          reviewer: 'Michael Brown',
          rating: 4,
          date: '10 months ago',
          text: 'Great service overall. The videos were high quality and delivered on time. Would recommend to others in the industry.',
          response:
            'Thank you for your feedback, Michael. We appreciate your recommendation and hope to work with you again soon.',
          responseDate: '10 months ago',
        },
        {
          id: 6,
          reviewer: 'Emily Davis',
          rating: 5,
          date: '1 year ago',
          text: "VidTech's drone footage really helped us stand out in a competitive market. Their team was professional and the final product exceeded our expectations.",
          response:
            "Thank you, Emily! We're thrilled that our drone footage helped you stand out. We're always striving to exceed expectations.",
          responseDate: '1 year ago',
        },
        {
          id: 7,
          reviewer: 'David Wilson',
          rating: 5,
          date: '1 year ago',
          text: 'Working with VidTech was a game-changer for our property listings. The quality of their work is consistently excellent.',
          response:
            "Thank you for your kind words, David. We're glad we could help enhance your property listings.",
          responseDate: '1 year ago',
        },
        {
          id: 8,
          reviewer: 'Jennifer Lee',
          rating: 5,
          date: '1 year ago',
          text: "VidTech's team is responsive, professional, and delivers high-quality videos that showcase our properties beautifully.",
          response:
            "Thank you, Jennifer! We're glad our services met your expectations. We look forward to working with you again.",
          responseDate: '1 year ago',
        },
        {
          id: 9,
          reviewer: 'Robert Taylor',
          rating: 4,
          date: '1 year ago',
          text: 'Good experience overall. The videos were well-produced and helped us sell our properties faster than expected.',
          response:
            "Thank you for your feedback, Robert. We're glad our videos helped with your property sales.",
          responseDate: '1 year ago',
        },
        {
          id: 10,
          reviewer: 'Lisa Anderson',
          rating: 5,
          date: '1 year ago',
          text: "VidTech's attention to detail and commitment to quality is evident in every video they produce. Highly recommend!",
          response:
            'Thank you, Lisa! We appreciate your recommendation and look forward to working with you again.',
          responseDate: '1 year ago',
        },
        {
          id: 11,
          reviewer: 'Thomas Martinez',
          rating: 3,
          date: '11 months ago',
          text: 'The video quality was good, but the turnaround time was longer than expected. Communication could have been better.',
          response: null,
          responseDate: null,
        },
        {
          id: 12,
          reviewer: 'Amanda White',
          rating: 4,
          date: '9 months ago',
          text: 'Overall satisfied with the service. The drone footage was impressive, but the editing could have been more polished.',
          response: null,
          responseDate: null,
        },
        {
          id: 13,
          reviewer: 'James Wilson',
          rating: 2,
          date: '7 months ago',
          text: "Disappointed with the final product. The video didn't highlight our property's best features and felt rushed.",
          response: null,
          responseDate: null,
        },
        {
          id: 14,
          reviewer: 'Patricia Garcia',
          rating: 5,
          date: '5 months ago',
          text: 'VidTech went above and beyond to capture the essence of our property. The attention to detail was remarkable.',
          response: null,
          responseDate: null,
        },
        {
          id: 15,
          reviewer: 'Kevin Thompson',
          rating: 4,
          date: '3 months ago',
          text: 'Professional team and good quality work. Would use their services again for future projects.',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 2,
      name: 'Pivotal Video Productions',
      location: 'Woodstock, GA',
      address: '123 Main St, Woodstock, GA 30188',
      phone: '(678) 123-4567',
      website: 'pivotalvideo.com',
      linkedin: 'https://www.linkedin.com/company/pivotal-video/',
      rating: 4.7,
      reviewCount: 28,
      status: 'active',
      notes: 'Specializes in real estate video production and aerial photography.',
      reviews: [
        {
          id: 1,
          reviewer: 'John Smith',
          rating: 5,
          date: '1 month ago',
          text: 'Pivotal Video did an amazing job with our property video. The quality was exceptional and they were very professional throughout the process.',
          response:
            "Thank you for your kind words, John! We're glad you were satisfied with our work.",
          responseDate: '1 month ago',
        },
        {
          id: 2,
          reviewer: 'Sarah Johnson',
          rating: 4,
          date: '3 months ago',
          text: 'Good service overall, but a bit slow on delivery. The final product was worth the wait though.',
          response:
            "Thank you for your feedback, Sarah. We're working on improving our delivery times.",
          responseDate: '3 months ago',
        },
      ],
    },
    {
      id: 3,
      name: 'Dolce Vita Visuals',
      location: 'Woodstock, GA',
      address: '456 Oak Ave, Woodstock, GA 30188',
      phone: '(678) 987-6543',
      website: 'dolcevitavisuals.com',
      linkedin: 'https://www.linkedin.com/company/dolce-vita-visuals/',
      rating: 4.5,
      reviewCount: 15,
      status: 'active',
      notes: 'High-end real estate photography and videography services.',
      reviews: [
        {
          id: 1,
          reviewer: 'Michael Brown',
          rating: 5,
          date: '2 months ago',
          text: 'Dolce Vita Visuals captured our property beautifully. The attention to detail was impressive.',
          response: "Thank you, Michael! We're glad you were happy with our work.",
          responseDate: '2 months ago',
        },
      ],
    },
    {
      id: 4,
      name: 'The Georgia Drone',
      location: 'Atlanta, GA',
      address: '1220 Mecaslin St NW #1405, Atlanta, GA 30332',
      phone: '(404) 980-7080',
      website: 'thegeorgiadrone.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 18,
      status: 'active',
      notes:
        'Specializes in providing stunning, cinematic, full-motion aerial video & photos from the skies of Georgia and the southeast. Services span across multiple industries such as construction, commercial & residential real estate, inspections, and special events. FAA Part 107 Certified. DBE Certified in Georgia. UAV Insured.',
      services:
        'Real estate photography, Aerial Drone Inspection, Aerial Drone Photography, Aerial Footage, Aerial Imagery, Aerial Images, Aerial Photography & Videography, Aerial Thermal Imaging, Aerial Thermography, Aerial Video & Photos, Aerial View, Birdseye View, Bridge Inspections, Building Photography, Car Shows, Cinematic Aerial Video, Cinematic Fpv, Commercial Inspections, Commercial Properties, Construction Inspections, Construction Projects, Construction Sites, Drone Footage, Drone Photography & Video, Drone Photography And Videography, Drone Photos And Videos, Drone Tour, Drones In Construction, Ground Photography, Inspection Photography, Inspections Image, Inspections Photography, Post-Production, Power Line Inspections, Project Planning, Property Inspections, Residential Properties, Search And Rescue, Solar Panel Inspections, Special Events, Structural Inspections, Thermal Drone Inspections, Thermal Image, Thermal Imagery, Thermal Photography, Vibration Monitoring, Video Footage, Wind Turbine Inspections',
      yearsInBusiness: 7,
      reviews: [
        {
          id: 1,
          reviewer: 'Presley Sullivan',
          rating: 5,
          date: 'a year ago',
          text: "I didn't have the honor of getting to meet Alex in person, but I have been communicating with him via email regarding searching for a missing family member of mine. I just wanted to share how incredibly kind Alex is & how thankful my family is for his help.",
          response:
            "Hi Presley! I am deeply appreciative of the recognition. I honestly did not expect it. I just wanted to help your family in locating your great uncle. I had the pleasure of meeting your mom when I did finally make it to the area. She's a very sweet and kind woman. Thank you again for all of your kind words and efforts! Take care.",
          responseDate: 'a year ago',
        },
        {
          id: 2,
          reviewer: 'Tamika Stewart',
          rating: 5,
          date: '3 years ago',
          text: "I've worked with Alex on several video projects and he's quickly turned into my go-to vendor! He's articulate, responsive and he's very good at seeing a vision through. He's been great to work with and patient as I always go through many revision cycles. He's very professional and his video skills are excellent.",
          response: 'Thank you Tamika! Always a pleasure working with you and the team!',
          responseDate: '3 years ago',
        },
        {
          id: 3,
          reviewer: 'Paul Brown',
          rating: 5,
          date: 'a year ago',
          text: 'Alex was extremely patient and spent a lot of time making sure we had exactly what we wanted. We are thrilled with the results.',
          response: 'Thanks Nahid!',
          responseDate: 'a year ago',
        },
        {
          id: 4,
          reviewer: 'Grace Mallon',
          rating: 5,
          date: '4 years ago',
          text: 'I worked with The Georgia Drone to film and edit a video of the 2020 Georgia Tech Wreck Parade, an annual homecoming tradition. The parade plans were constantly changing due to weather and COVID conditions, but throughout the whole process, Alex was incredibly patient, flexible, and professional. The final product was exactly what we needed and more!',
          response: 'Thank you Grace! Really enjoyed working with you and the Georgia Tech team!',
          responseDate: '4 years ago',
        },
        {
          id: 5,
          reviewer: 'Daniel Bishop',
          rating: 5,
          date: 'a year ago',
          text: "I'm usually not one to share, but the footage quality that Alex provided was exactly what I needed. Will definitely use him again.",
          response: 'Thanks Daniel!',
          responseDate: 'a year ago',
        },
        {
          id: 6,
          reviewer: 'Brielle Bennett',
          rating: 5,
          date: 'a year ago',
          text: 'Top notch! Alex at The Georgia Drone, did an amazing job with our videos. Very professional and responsive. Highly recommended.',
          response: 'Thank you!',
          responseDate: 'a year ago',
        },
        {
          id: 7,
          reviewer: 'Douglas Armstrong',
          rating: 5,
          date: 'a year ago',
          text: 'Alex did great work on my project. Super professional and very responsive!',
          response: 'Thanks Douglas!',
          responseDate: 'a year ago',
        },
        {
          id: 8,
          reviewer: 'Nicholas Duncan',
          rating: 5,
          date: 'a year ago',
          text: "Alex provided the best drone photos and videos for our Airbnb in Stone Mountain! I'd highly recommend using him for any drone footage!",
          response: 'Thanks Nicholas! Appreciate the business!',
          responseDate: 'a year ago',
        },
        {
          id: 9,
          reviewer: 'Tonya Purcell',
          rating: 5,
          date: '5 years ago',
          text: "Alex was so patient and spent so much time making sure we had exactly what we wanted. I'm thrilled with the results.",
          response: 'Thank you Tonya! It was fun working with you and Jeff!',
          responseDate: '5 years ago',
        },
        {
          id: 10,
          reviewer: 'Matthew Levin',
          rating: 5,
          date: '2 years ago',
          text: 'Alex at The Georgia Drone exceeded my expectations for a drone video to market a commercial parcel in Atlanta. He is a real pro. Matt Levin - SVN Interstate Brokers',
          response: 'Thank you Matthew! Glad we exceeded your expectations.',
          responseDate: '2 years ago',
        },
        {
          id: 11,
          reviewer: 'Josh McKain',
          rating: 5,
          date: '7 years ago',
          text: 'They were awesome. High quality and professional.',
          response: 'Thanks Josh! Great working with you and your team.',
          responseDate: '7 years ago',
        },
        {
          id: 12,
          reviewer: 'Christian Chase',
          rating: 5,
          date: '3 years ago',
          text: 'Alex is the man! Excellent work.',
          response: 'Thank you Christian! Was great working work you and Robert!',
          responseDate: '3 years ago',
        },
        {
          id: 13,
          reviewer: 'Megan Snyder',
          rating: 5,
          date: '6 years ago',
          text: 'Great communication & turn around time!',
          response: 'Thanks Megan!',
          responseDate: '6 years ago',
        },
        {
          id: 14,
          reviewer: 'Justin Wyatt',
          rating: 5,
          date: '4 years ago',
          text: 'Excellent service and quality work!',
          response: 'Thanks Justin!',
          responseDate: '4 years ago',
        },
        {
          id: 15,
          reviewer: 'Tommie Lee',
          rating: 5,
          date: '3 months ago',
          text: 'Alex was professional and delivered exactly what we needed for our property listing.',
          response: 'Thank you!!',
          responseDate: '3 months ago',
        },
        {
          id: 16,
          reviewer: 'Vally Gal',
          rating: 5,
          date: 'a year ago',
          text: 'The aerial footage Alex provided for our construction project was outstanding. Highly recommend!',
          response: 'Thank you!',
          responseDate: 'a year ago',
        },
        {
          id: 17,
          reviewer: 'Chris Nelson',
          rating: 5,
          date: '2 years ago',
          text: "Alex's drone photography helped us showcase our property in a way that traditional photos couldn't. Great service!",
          response: 'Thanks Chris!',
          responseDate: 'a year ago',
        },
        {
          id: 18,
          reviewer: 'Shannon Ellis',
          rating: 5,
          date: '5 years ago',
          text: 'The Georgia Drone provided excellent aerial footage for our annual event. Will definitely use their services again.',
          response: 'Thank you Shannon! See you next year!',
          responseDate: '4 years ago',
        },
      ],
    },
    {
      id: 5,
      name: 'Cherokee Drone Real Estate Photography',
      location: 'Atlanta, GA',
      address: 'Atlanta, GA',
      phone: '(770) 881-4099',
      website: 'cherokeedrone.com',
      linkedin: '',
      rating: 4.8,
      reviewCount: 34,
      status: 'active',
      notes:
        'Cherokee Drone Real Estate Photography is your trusted local partner for Real Estate Photography in North Atlanta and across North Georgia. We specialize in Interior photography, drone photography, real estate video tours, 3D virtual walkthroughs, and more.',
      services:
        'Real estate photography, Interior photography, Drone photography, Real estate video tours, 3D virtual walkthroughs, Matterport 360 Tours, Luxury video, Custom homes, Construction documentation',
      yearsInBusiness: 7,
      reviews: [
        {
          id: 1,
          reviewer: 'Tony Narcisse',
          rating: 5,
          date: '4 days ago',
          text: "This is the best photography service I've used for my real estate listings. The images were beautifully shot, and the refinishing really helped the images pop. The photographers were punctual, and the communication was spectacular. All in all, the service exceeded my expecations. I'll use again and can happily refer to others.",
          response:
            "Thank you so much for the kind words Tony! We're thrilled to hear that you had such a positive experience with our photography services. It means a lot to know that the images and refinishing made a strong impact, and we're glad our team's punctuality and communication stood out. We truly appreciate your support and look forward to working with you again soon!",
          responseDate: '4 days ago',
        },
        {
          id: 2,
          reviewer: 'Sherri Webb',
          rating: 5,
          date: '3 weeks ago',
          text: "I have had a couple listing photos shoots with Cherokee Drone so far and I plan on using them over and over! It's obvious how professional and accommodating they are just within a few appointments I have had! Quick to respond and on time!",
          response:
            "Thank you so much, Sherri, for the kind words! We're thrilled to hear you've had a great experience with Cherokee Drone and that our work reflects the high standards you've set as an agent. We look forward to continuing to support your listings and working together on many more successful shoots!",
          responseDate: '3 weeks ago',
        },
        {
          id: 3,
          reviewer: 'Emily Mariano',
          rating: 5,
          date: '4 years ago',
          text: 'Cody did an amazing job photographing my listing! He was good at his job, respectful, kind and got in and out in a timely manner. Amanda has been fantastic, getting back to me promptly and answering all my questions. Definitely will use Cherokee Drone again.',
          response:
            'Emily, you are so kind! Thanks a million for your business! We appreciate you!',
          responseDate: '4 years ago',
        },
        {
          id: 4,
          reviewer: 'Lauren and Keith Silberman',
          rating: 5,
          date: 'a year ago',
          text: 'AMAZING experience! This was our first time using Cherokee Drone Services, and I am extremely impressed. The photos Ryan took look fantastic and the customer service was the best I have ever experienced with a real estate photography service.',
          response:
            'Thank you so much Lauren! We really appreciate you and your continued support of us!',
          responseDate: '9 months ago',
        },
        {
          id: 5,
          reviewer: 'Stephen',
          rating: 5,
          date: 'a year ago',
          text: 'They have been my go to photographer for 5+ years. Mile and the team are always very professional and knowledgeable. If any issues do arise (rearly) they are quick to correct',
          response: 'Thank you Stephen! It is always a joy working with you!',
          responseDate: '9 months ago',
        },
        {
          id: 6,
          reviewer: 'Stacey Arend',
          rating: 2,
          date: 'a year ago',
          text: 'The pictures were alright, but the service was not great at all. First, we sat at the house long past the start time called and found out he only did the drone shot and had to come back late. Then, when I got the bill, it had a $100 travel fee that was never mentioned.',
          response:
            "Stacey, This property was shot 6 months ago and you were 100% satisfied with everything we did until recently, when we were contacted by a representative of the seller. They explained to us that the homeowner wished to not work with you anymore. I don't know the reason that you were removed from the listing and its none of my business. The homeowner asked to use their photos that were taken during the summer, when everything was green. There is no way in the world that I could tell the homeowner that they couldn't use their photos of their house and their furniture to sell their home. I assume that the Georgia Real Estate Commission already told you the same thing or you wouldn't have resorted to Google Reviews 6 months later.",
          responseDate: 'a year ago',
        },
        {
          id: 7,
          reviewer: 'Dawne Deverell',
          rating: 5,
          date: '4 years ago',
          text: 'Cherokee Drone is my "go-to" photography wizard on ALL of my listings. They are prompt, professional, and get the best shots for my clients. Love Christo and Mike behind the camera as well as the always pleasant Amanda in the office. A+',
          response:
            'Thank you so much, Dawne! We absolutely love having you as a client. Thanks for always being so kind and professional! Have a lovely evening!',
          responseDate: '4 years ago',
        },
        {
          id: 8,
          reviewer: 'aylisis rodriguez',
          rating: 5,
          date: '7 years ago',
          text: 'We had a crisis and Mike at Cherokee drone came to the rescue!! We had just put our house on the market, and our real estate agent had a photographer come out and take our pictures (they were supposed to take drone pictures and their drone was broken). Mike came out the next day and took amazing drone pictures of our house. He was so professional and the pictures were beautiful. I highly recommend Cherokee Drone for any real estate photography needs!',
          response: 'Hey there, so sorry I missed this! Thank you so much for the kind words!',
          responseDate: '4 years ago',
        },
        {
          id: 9,
          reviewer: 'Amy Spence',
          rating: 5,
          date: '6 years ago',
          text: 'Cherokee Drones has high- quality photography, but also TOP NOTCH customer service. They are creative, skilled photographers who are GREAT with my clients and deliver photos exactly as promised. I am a very tough client and they exceed my expectations everytime!',
          response:
            "Amy, we're so sorry we missed this!! Thank you so so much for the review! We love having you as a client. Thank you for your business!",
          responseDate: '4 years ago',
        },
        {
          id: 10,
          reviewer: 'Tammy Wissing',
          rating: 5,
          date: '4 years ago',
          text: 'Love the photos they take of my real estate listings. The lighting and angles are perfect. The drone shots are great!!! They always work with me on scheduling and cancellations or rebookings. I love working with them and highly recommend them for your next real estate photo shoot.',
          response: 'Thank you so much, Tammy! We love you!',
          responseDate: '4 years ago',
        },
        {
          id: 11,
          reviewer: 'Joseph Keller',
          rating: 5,
          date: '7 years ago',
          text: 'I am buying a home that Cherokee Drone Services took pictures of. I was so impressed by the quality of pictures and the understanding of what the buyer wants to see in pictures I had to review. Best pictures I have seen throughout my buying venture!',
          response: 'Thank you so much, Joseph! We appreciate the review. Have a great day!',
          responseDate: '4 years ago',
        },
        {
          id: 12,
          reviewer: 'Dan Ellsworth',
          rating: 5,
          date: '2 years ago',
          text: "We've loved working with Cherokee Drone Services. They create some amazing, very high quality videos and Matterports of the custom homes with construct. Would definitely recommend!",
          response: 'Thanks Dan! We love working with your team as well.',
          responseDate: 'a year ago',
        },
        {
          id: 13,
          reviewer: 'Michael Bishop',
          rating: 5,
          date: '7 years ago',
          text: "The owner, Mike, is one of the most likable people you will ever meet. He's got a very artist eye and his passion for his work is obvious. I highly recommend his services.",
          response: null,
          responseDate: null,
        },
        {
          id: 14,
          reviewer: 'Sophronia Qualls',
          rating: 5,
          date: '4 years ago',
          text: 'Cherokee Drone is the best photo service for listings. Christo the photographer knew every angle to showcase my listings. Very professional!',
          response:
            "Thank you so much for the review, Sophronia! We love Christo and we're so glad you do, too!",
          responseDate: '4 years ago',
        },
        {
          id: 15,
          reviewer: 'Ashley Mussman',
          rating: 5,
          date: '7 years ago',
          text: 'From St.Croix to Atlanta, the owner, Mike, is well rounded and knowledgeable in his craft. He is easy to work with and I can promise you will be pleased with the results.',
          response: null,
          responseDate: null,
        },
        {
          id: 16,
          reviewer: 'Rick Warnke',
          rating: 5,
          date: '7 years ago',
          text: 'Highly talented individual with an artist command in the studio. You will love the production so much you might not want to sell your property ! Engage his services now.',
          response: null,
          responseDate: null,
        },
        {
          id: 17,
          reviewer: 'Chef Michael William',
          rating: 5,
          date: '7 years ago',
          text: 'Cherokee Drone Services will Transport you through time and space with mesmerizing images and videos that Capture the Essence of your experience.',
          response: null,
          responseDate: null,
        },
        {
          id: 18,
          reviewer: 'Brian Ferris',
          rating: 5,
          date: '7 years ago',
          text: 'Phenomenal service, they a great job! If you have a home property you want listed definately give them a call... photos are fantastic.',
          response: null,
          responseDate: null,
        },
        {
          id: 19,
          reviewer: 'Keith Grogan',
          rating: 5,
          date: 'a year ago',
          text: 'The best real estate photographers in the state of Georgia. Absolutely outstanding!',
          response: 'Thanks so much Keith!',
          responseDate: 'a year ago',
        },
        {
          id: 20,
          reviewer: 'Matt Osman',
          rating: 5,
          date: '7 years ago',
          text: "Cherokee Drones' videos adds instant credibility to any listing and an essential member of a Realator's team in the new age of digital media and marketing!",
          response: null,
          responseDate: null,
        },
        {
          id: 21,
          reviewer: 'Benjamin Smith',
          rating: 5,
          date: '7 years ago',
          text: 'Highly recommended -- professional, prompt service very reasonably priced; high quality visual products that were used for a substantial landscaping redesign.',
          response: 'Thank you, Benjamin!',
          responseDate: '4 years ago',
        },
        {
          id: 22,
          reviewer: 'Matt Killday',
          rating: 5,
          date: '7 years ago',
          text: 'Top notch company, top notch work! Highly recommend to anyone selling a property or looking for a unique perspective on a marketing video!',
          response: null,
          responseDate: null,
        },
        {
          id: 23,
          reviewer: 'Caleb Prose',
          rating: 5,
          date: '7 years ago',
          text: 'Cherokee Drone took fabulous pictures of our home so we could put it on the market!',
          response: 'Thank you so much, Caleb!',
          responseDate: '4 years ago',
        },
        {
          id: 24,
          reviewer: 'Mitch A',
          rating: 5,
          date: '7 years ago',
          text: 'Mr. Haymes, (Mikey) follows through and makes good on his promises!',
          response: 'Thanks MItch!',
          responseDate: 'a year ago',
        },
        {
          id: 25,
          reviewer: 'Josh McKinney',
          rating: 5,
          date: '3 years ago',
          text: 'Timely responses! Easy to work with! Great staff!',
          response: 'Thank you so much, Josh! We appreciate your business!',
          responseDate: '3 years ago',
        },
        {
          id: 26,
          reviewer: 'Paul Raiti',
          rating: 5,
          date: 'a year ago',
          text: 'Great experience all around',
          response: 'Thanks so much Paul!',
          responseDate: 'a year ago',
        },
        {
          id: 27,
          reviewer: 'Deb Luedtke',
          rating: 5,
          date: '3 years ago',
          text: 'Excellent service and the photos are beautiful!',
          response: 'Thank you, Deb! Your review means so much to us!',
          responseDate: '3 years ago',
        },
        {
          id: 28,
          reviewer: 'Janet Tweedie',
          rating: 4,
          date: 'a year ago',
          text: 'Good service but could be improved',
          response:
            "Hey Janet, Thanks so much for your review. I would love to see what we could do to make that a 5 star review! I don't see you on our client list. I would love to see what we can do better next time. Thanks!",
          responseDate: 'a year ago',
        },
        {
          id: 29,
          reviewer: 'Michelle Ellison',
          rating: 5,
          date: '7 years ago',
          text: 'Great service and quality photos!',
          response: null,
          responseDate: null,
        },
        {
          id: 30,
          reviewer: 'Sean Cullinan',
          rating: 5,
          date: '7 years ago',
          text: 'Excellent work and very professional!',
          response: null,
          responseDate: null,
        },
        {
          id: 31,
          reviewer: 'Tiffany Setlak',
          rating: 5,
          date: '7 years ago',
          text: 'Cherokee Drone did an amazing job with our property photos. Highly recommend!',
          response: null,
          responseDate: null,
        },
        {
          id: 32,
          reviewer: 'Shelby Maendler',
          rating: 5,
          date: '7 years ago',
          text: 'The photos were beautiful and helped us sell our home quickly!',
          response: null,
          responseDate: null,
        },
        {
          id: 33,
          reviewer: 'Dani Coppola',
          rating: 5,
          date: '7 years ago',
          text: 'Mike and his team are the best in the business!',
          response: null,
          responseDate: null,
        },
        {
          id: 34,
          reviewer: 'Jennifer Larva',
          rating: 5,
          date: '7 years ago',
          text: 'Cherokee Drone provided excellent service and high-quality photos for our listing.',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 6,
      name: 'AirWise Drone Services',
      location: 'Gainesville, GA',
      address: '2580 Dunlap Mill Rd, Gainesville, GA 30506',
      phone: '(678) 492-7485',
      website: 'airwisedroneservices.com',
      linkedin: '',
      rating: 4.9,
      reviewCount: 19,
      status: 'active',
      notes:
        'FAA Certified & Insured. Drone services in North Georgia and around the Southeast. We create high resolution aerial photos, custom edited videos, and much more!',
      services:
        'Aerial Photographs, Aerial Photography, Aerial Photos And Video, Aerial Shots, Aerial Video And Photography, Aerial Views, Agriculture Drone Services, Birds Eye View, Construction Drone Services, Construction Monitoring, Custom Projects, Drone Footage, Drone Photography And Videography, Drone Service Provider, Drone Services, Event Photography, Photography And Video Editing, Still Photos, Video And Photo Editing',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'lovedbyyates',
          rating: 5,
          date: 'a year ago',
          text: 'Used Derek at AirWise to obtain some aerial photography and videography of a local marina property. Fantastic images, great quality, and fair price! Derek was consistently quick to respond and attentive to our needs. Highly recommend!',
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'Shannon Burke',
          rating: 5,
          date: '5 years ago',
          text: 'Working with AirWise Drone Services was a very positive and professional experience for our company. Derek and the team exceeded our expectations with their high quality equipment and high quality technical skills. They were very flexible and accommodating to our needs.',
          response: 'Thanks for the review. Very much Enjoyed working with your team!',
          responseDate: '5 years ago',
        },
        {
          id: 3,
          reviewer: 'Accurate Roofing Pros',
          rating: 5,
          date: '2 years ago',
          text: 'We hired Derek to help us with some aerial images on a jobsite & video creation for an advertising and marketing campaign. He did a fabulous job! We are very pleased with his work! We will definitely use his services again.',
          response: null,
          responseDate: null,
        },
        {
          id: 4,
          reviewer: 'NE GA Property Solutions',
          rating: 5,
          date: '6 years ago',
          text: 'AirWise Drone Services took video of one our rental properties as we were putting it on the market. Derek did an outstanding job and offered tremendous value for our listing. Highly recommend.',
          response: null,
          responseDate: null,
        },
        {
          id: 5,
          reviewer: 'Barbara Cronic',
          rating: 5,
          date: '6 years ago',
          text: 'AirWise Drone Services did an outstanding job with the aerial videography of our farm. They were thorough, professional and creative, and offered suggestions to enhance our video even further. We highly recommend this company, and will call on them again when the need arises.',
          response: 'Really enjoyed working on this project!',
          responseDate: '6 years ago',
        },
        {
          id: 6,
          reviewer: 'Leo Skipper',
          rating: 5,
          date: '3 years ago',
          text: 'Top notch service provided by this company. Derek was extremely professional and his workmanship was exemplary. Best of all, the pricing was beyond reasonable. I will definitely use this company for all of my aerial photography needs.',
          response: null,
          responseDate: null,
        },
        {
          id: 7,
          reviewer: 'Nan Gregory',
          rating: 5,
          date: '2 years ago',
          text: 'Very prompt and professional service from Derek . Great shots I will use AirWise Drone Services again for sure. Nan Gregory Broker Blue Ridge Lake & Lake Lanier Properties.',
          response: 'Thanks for your review. Glad to help anytime!',
          responseDate: '2 years ago',
        },
        {
          id: 8,
          reviewer: 'Jeff Duplantis',
          rating: 5,
          date: '6 years ago',
          text: 'Airwise Drone provided prompt, cost-effective, quality services that exceeded our expectations. Their top concern was our satisfaction and even went back out to the site we were flying on another day to try and get better photos under different conditions. I would highly recommend their services to anyone needing aerial photography or videography.',
          response: 'Enjoyed working with you. Appreciate the kind words!',
          responseDate: '6 years ago',
        },
        {
          id: 9,
          reviewer: 'Michelle Biel-Aguirre',
          rating: 5,
          date: '5 years ago',
          text: 'My fiance is selling his house in Gainesville. We hired AirWise to shoot the home. We cant begin to share how much this improved the home listing and really allowed people to see the home and all the grounds. Derek was professional and the quality of the photos and video was outstanding. We highly recommend AirWise Drone Services!',
          response: 'Thanks for a great review, Michelle!',
          responseDate: '5 years ago',
        },
        {
          id: 10,
          reviewer: 'Stacy',
          rating: 5,
          date: '5 years ago',
          text: "I used AirWise to 'survey' my rural north Georgia property. Derek was responsive, personable and professional. He made sure I received the videos and pictures that I needed in a timely manner.",
          response: 'Thanks for the review. It was great working with you!',
          responseDate: '5 years ago',
        },
        {
          id: 11,
          reviewer: 'Rustin Smith',
          rating: 5,
          date: '6 years ago',
          text: 'High quality aerial photos and quick turnaround time. Derek is an awesome guy with integrity. You will not regret hiring AirWise!',
          response: null,
          responseDate: null,
        },
        {
          id: 12,
          reviewer: 'Rhonda Clark',
          rating: 5,
          date: '6 years ago',
          text: 'Quick turnaround time and great service! I use AirWise Drone Services for interior and aerial photos for real estate listings.',
          response: null,
          responseDate: null,
        },
        {
          id: 13,
          reviewer: 'Tiki Huts Unlimited',
          rating: 5,
          date: '5 years ago',
          text: "AirWise has excellent service and response time and professionalism! Couldn't be happier with our aerial and still photos and video.",
          response: 'Really appreciate your review. Thank you!',
          responseDate: '5 years ago',
        },
        {
          id: 14,
          reviewer: 'Damon Folmar',
          rating: 5,
          date: '5 years ago',
          text: 'Exceptional quality product and prompt service. We will use AirWise again!',
          response: null,
          responseDate: null,
        },
        {
          id: 15,
          reviewer: 'Caldwell Electrical Contractors',
          rating: 5,
          date: '2 years ago',
          text: 'Friendly, professional, and all around gerat Drone Services.',
          response: null,
          responseDate: null,
        },
        {
          id: 16,
          reviewer: 'Jim Draper',
          rating: 5,
          date: '2 years ago',
          text: "It is amazing you won't feel like leaving and will won't to come back",
          response: null,
          responseDate: null,
        },
        {
          id: 17,
          reviewer: 'Russell Gray',
          rating: 5,
          date: '6 years ago',
          text: 'Very professional very nice results',
          response: 'Really enjoyed your project. Thanks for the review!',
          responseDate: '6 years ago',
        },
        {
          id: 18,
          reviewer: 'Marc Segal',
          rating: 5,
          date: '6 years ago',
          text: 'Very helpful staff!',
          response: null,
          responseDate: null,
        },
        {
          id: 19,
          reviewer: 'David Blount',
          rating: 5,
          date: '6 years ago',
          text: 'Very nice and quiet',
          response: 'Do not recall doing any business with a David Blount, thanks for the review!',
          responseDate: '6 years ago',
        },
      ],
    },
    {
      id: 7,
      name: 'Atlanta Drone Pro',
      location: 'Canton, GA',
      address: '313 Meadow Lark Cross, Canton, GA 30114',
      phone: '(678) 800-4560',
      website: 'atlantadronepro.com',
      linkedin: '',
      rating: 4.9,
      reviewCount: 18,
      status: 'active',
      notes:
        'We provide Atlanta, GA with drone services including photography, videography, construction site monitoring, inspections, and much more! The sky is the limit and YOU choose it.',
      services:
        'Glass & mirror cleaning, Gutter cleaning, Interior & exterior window cleaning, Power/pressure washing, Rooftop/skylight cleaning, Aerial Photography, Aerial Soft Washing, Aerial Tour, Aerial View, Commercial Building, Commercial Real Estate Marketing, Construction Monitoring, Customized Drone, Drone Inspection, Drone Operators, Drone Pilots, Drone Tech, Drone Technology, Event Captures, Interior Photography, Land Surveying, Mapping, Multi Spectral Imaging, Predictive Maintenance, Residential Property, Roof Cleaning, Roof Inspections, Solar Panel Inspections, Thermal Imaging, Thermal Inspection, Thermal Scan, Time-lapse Camera, Videography, Window Cleaning, Solar Panel Survey',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Jan Cutini',
          rating: 5,
          date: '3 years ago',
          text: "Chris cleaned the stains off my roof and pressure washed the entire house. 32 year old home with a 15 year old roof looks brand new! We can't believe the difference! Highly recommend Chris for his professionalism and courteous service at a very reasonable cost! Thank you Chris! (the drone was awesome!)",
          response: 'Thank you for the kind words Jan. It was a pleasure restoring your home.',
          responseDate: '3 years ago',
        },
        {
          id: 2,
          reviewer: 'beth capogrossi',
          rating: 5,
          date: '3 years ago',
          text: 'Highly recommend Chris. He did an amazing job cleaning our roof and house. Very professional and fairly priced. Will definitely use again.',
          response: 'Thank you Beth, happy to be of service.',
          responseDate: '3 years ago',
        },
        {
          id: 3,
          reviewer: 'Sherry Able',
          rating: 5,
          date: '3 years ago',
          text: 'Chris did a fantastic job! Scheduling, pricing, communication and job performance were all excellent! Our roof looks new again! I highly recommend Chris as you will not be disappointed!',
          response: 'Thanks for the kind words, Sherry!',
          responseDate: '3 years ago',
        },
        {
          id: 4,
          reviewer: 'Shaun',
          rating: 5,
          date: '3 years ago',
          text: 'Chris was very professional. He has top notch equipment and was very thorough. I highly recommend for roof cleaning. Algae was destroying our shingles making our roof look terrible, looks brand new now!',
          response: 'Thanks Shaun, you have an amazing view at your house!',
          responseDate: '3 years ago',
        },
        {
          id: 5,
          reviewer: 'Rob Johanos',
          rating: 5,
          date: '3 years ago',
          text: 'Chris did an excellent job he always does I recommend him for all year power washing needs also if you need pictures or videos from a drone no one is more artistic',
          response: 'Thank you for choosing us Rob!',
          responseDate: '3 years ago',
        },
        {
          id: 6,
          reviewer: 'Jeremy T',
          rating: 5,
          date: '3 years ago',
          text: 'Atlanta Drone Pro is just what there name suggests. I use them anytime I need drone photos or videos done. High quality photography at a good price when you need it. I look forward to continuing to use them in the future.',
          response: null,
          responseDate: null,
        },
        {
          id: 7,
          reviewer: 'Thomas Sobolewski',
          rating: 5,
          date: '3 years ago',
          text: 'Chris did a great quality job for a good price at my parents home. I highly recommend him. Thanks',
          response: 'Thanks Thmoas, it was my pleasure to power wash their home.',
          responseDate: '3 years ago',
        },
        {
          id: 8,
          reviewer: 'Matt McCollum',
          rating: 5,
          date: '3 years ago',
          text: "This is not only the coolest service you'll ever use but one of the most professional and courteous. Chris truly does not stop until the job is completed to the highest standard.",
          response: null,
          responseDate: null,
        },
        {
          id: 9,
          reviewer: "Darrin O'Neill",
          rating: 5,
          date: '3 years ago',
          text: 'Very professional and quick turn around! I would definitely recommend to anyone that needs drone footage! Weddings, Real Estate, your small business, etc etc. They can do it all!',
          response: 'We appreciate that review!',
          responseDate: '3 years ago',
        },
        {
          id: 10,
          reviewer: 'Kristin Sliger',
          rating: 5,
          date: '3 years ago',
          text: 'Professional and quick. Cleaned years of mold build up off the house siding and it looks great now!',
          response: null,
          responseDate: null,
        },
        {
          id: 11,
          reviewer: 'Tim Felbinger',
          rating: 5,
          date: '3 years ago',
          text: 'Chris was able to come out on relatively short notice and delivered great footage for my commercial video project',
          response: 'Pleasure working with you Tim.',
          responseDate: '3 years ago',
        },
        {
          id: 12,
          reviewer: 'Nhu Phan',
          rating: 5,
          date: '3 years ago',
          text: 'Did an awesome job cleaning my driveway, garage, deck, and side of house and great value!',
          response: 'Thank you for the kind words Nhu!',
          responseDate: '3 years ago',
        },
        {
          id: 13,
          reviewer: 'Arturo Howard',
          rating: 5,
          date: '3 years ago',
          text: 'Great company, I had an amazing experience with the staff, the videos and drone shots are top notch 👌',
          response: 'Thank you Arturo.',
          responseDate: '3 years ago',
        },
        {
          id: 14,
          reviewer: 'Theresa Brubaker',
          rating: 5,
          date: '3 years ago',
          text: 'Need the ugly streaks on your roof removed? Contact Atlanta Drone Pro to do the job!',
          response: null,
          responseDate: null,
        },
        {
          id: 15,
          reviewer: 'Loney Leek',
          rating: 5,
          date: '3 years ago',
          text: 'Great service and professional staff!',
          response: null,
          responseDate: null,
        },
        {
          id: 16,
          reviewer: 'Sylvia Ervin',
          rating: 5,
          date: '3 years ago',
          text: 'Excellent work on our property!',
          response: null,
          responseDate: null,
        },
        {
          id: 17,
          reviewer: 'Casey Ennis',
          rating: 5,
          date: '3 years ago',
          text: 'Very satisfied with the service provided.',
          response: null,
          responseDate: null,
        },
        {
          id: 18,
          reviewer: 'TTVcharles 395',
          rating: 5,
          date: '3 years ago',
          text: 'Professional and efficient service.',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 8,
      name: 'Humbird Visuals | Georgia Drone Marketing',
      location: 'Atlanta, GA',
      address: '2383 Akers Mill Rd SE, Atlanta, GA 30339',
      phone: '(678) 923-4686',
      website: 'humbirdvisuals.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 18,
      status: 'active',
      notes:
        'Humbird Visuals elevates your brand and tells your story from a unique perspective. With our expertise in drone technology and cinematography, we create immersive and engaging content that will leave a lasting impression on your audience.',
      services:
        'Aerial Drone Imagery, Aerial Drone Photography, Aerial Footage, Aerial Images, Aerial Video, Aerial Video & Photo, Aerial Videographer, Aerial Videography, Aerial Views, Cinematic Aerial Videography, Cinematics Fpv, Commercial Aerial Photography, Commercial Production, Commercial Real Estate, Commercial Videography, Content Creators, Content Marketing, Drone Fly, Drone Footage, Drone Photography, Drone Tech, Drone Technologies, Drone Technology, Drone Videographer, Drone Videography, Edited Video, First Person View, Fpv Drone, Fpv Drone Tours, Fpv Drones, Indoor - Outdoor FPV Drone Service, Indoor Drone Tours, Motion Graphics, Projects Video Production, Property Tours, Real Estate, Real Estate Aerial Photography, Real Estate Photo, Real Estate Photography, Residential Real Estate, Video / Photo Editing, Video / Photography, Video Content, Video Marketing, Video Production, Video Video, Virtual Tours',
      yearsInBusiness: 3,
      reviews: [
        {
          id: 1,
          reviewer: 'Michael Kidd',
          rating: 5,
          date: '8 months ago',
          text: 'My experience with Humbird Visuals was fantastic! Eric was very professional and easy to work with. The quality of his work is outstanding. I highly recommend Humbird Visuals and plan to use them for future projects.',
          response:
            'It was a pleasure working with you Michael, Looking forward to the future projects. Cheers!',
          responseDate: '8 months ago',
        },
        {
          id: 2,
          reviewer: 'Lawson C.',
          rating: 5,
          date: '2 months ago',
          text: 'Eric with Humbird Visuals is my go-to vendor for all of my aerial photography and videography needs! He did a wonderful job conducting a shoot for a commercial property in Atlanta that I manage, and I will certainly be going back to him when our other properties need their own shoots. Very responsive and professional, with great quality pictures. Would recommend him to any other property managers or real estate professionals.',
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'CarLife',
          rating: 5,
          date: '5 months ago',
          text: "10/10 experience. Eric was incredible to work with and was 100% reliable, which is the most important thing. Always communicating before, during, and after the shoot as well as delivering a perfect product every time. We'll be using Humbird Visuals for all of our drone content in the area moving forward. Thanks again!",
          response: null,
          responseDate: null,
        },
        {
          id: 4,
          reviewer: 'Deanna M',
          rating: 5,
          date: '11 months ago',
          text: "We recently hired Humbird Visuals for a City of Alpharetta project, and I couldn't be more impressed with Eric's work! From start to finish, the experience was seamless and professional. Eric was incredibly responsive and attentive to our needs, and the final product exceeded our expectations. The aerial footage he captured perfectly showcased our city's beauty and amenities. I highly recommend Humbird Visuals for any aerial photography or videography needs!",
          response: null,
          responseDate: null,
        },
        {
          id: 5,
          reviewer: 'Angel Cornista',
          rating: 5,
          date: '6 months ago',
          text: 'Preston Ridge Community Center - City of Alpharetta works with Humbird Visuals with facility virtual tour, events, parks, and more! They provide the best service, communicates well, and creates the best visuals for us to use for any marketing materials. Highly recommend!',
          response: null,
          responseDate: null,
        },
        {
          id: 6,
          reviewer: 'Derek Waleko',
          rating: 5,
          date: '4 months ago',
          text: 'Highly recommend. Working with Humbird was a great experience. Great communication and the final footage was what we needed. Professionals ever step of the way.',
          response: null,
          responseDate: null,
        },
        {
          id: 7,
          reviewer: 'Discover Dunwoody',
          rating: 5,
          date: 'a year ago',
          text: "Humbird Visuals, led by Eric, is an exceptional drone company that delivers top-notch service and stunning results. From our initial meeting, Eric demonstrated a deep understanding of our project's requirements and was thorough in his approach. The final footage exceeded our expectations and perfectly captured the essence of our community. We've received numerous compliments on the quality of the aerial footage, and we're thrilled with the outcome. I highly recommend Humbird Visuals for any aerial photography or videography needs!",
          response: 'Thank you very much for the opportunity! It was a pleasure',
          responseDate: 'a year ago',
        },
        {
          id: 8,
          reviewer: 'DJ Woods',
          rating: 5,
          date: 'a year ago',
          text: 'It has been such a pleasure working with Eric and the team. We had previous experience with other aerial photographers, and they did not go well. Eric is extremely knowledgeable and professional; all transactions have gone very smoothly. We look forward to doing business long term with Humbird Visuals. Highly recommended!',
          response:
            'Hey DJ, its been a pleasure and we look forward to future projects with you all. Thank you for the opportunity!',
          responseDate: 'a year ago',
        },
        {
          id: 9,
          reviewer: 'Live More Campervans',
          rating: 5,
          date: 'a year ago',
          text: 'We had the great pleasure of having Eric take footage of our production line for our van company and this man exceeded every expectation we had! He was articulate in his instructions, thoroughly planned out, and had our video ready within a timely manner. The quality of his work is outstanding. We will definitely be using him when our other properties need their own shoots. Very responsive and professional, with great quality pictures. Would recommend him to any other property managers or real estate professionals.',
          response: null,
          responseDate: null,
        },
        {
          id: 10,
          reviewer: 'Sean Franklin',
          rating: 5,
          date: 'a year ago',
          text: "Eric is the man! I hired Humbird Visuals to help me out with drone video for wedding films. Eric is kind, professional and a true expert at what he does. I'll admit I was hesitant to contract out a service I personally provided for my clients, but Eric made me a believer. His work is top-notch and he's a pleasure to work with. I'll definitely be using his services again!",
          response: null,
          responseDate: null,
        },
        {
          id: 11,
          reviewer: 'Ashley Ball',
          rating: 5,
          date: 'a year ago',
          text: "Eric and Humbird Visuals knocked it out of the park with drone fly-throughs and aerial photos of our builder's new construction communities all over the metro Atlanta area. He was super flexible with our timeline and helped us with editing for a seamless delivery of some great footage for our digital marketing. Highly recommend!",
          response: 'Thank you very much Ashley! It was a pleasure working with you',
          responseDate: 'a year ago',
        },
        {
          id: 12,
          reviewer: 'Doug Waite',
          rating: 5,
          date: 'a year ago',
          text: 'Visually stunning and emotionally breathtaking drone video of our country club! Pinetree Country Club in Kennesaw holds an esteemed annual golf event called The Silver Cup. The evening before the event we have a large party and Eric captured the essence of our club perfectly. The aerial footage showcased our beautiful property and the excitement of the event. We received numerous compliments on the video and will definitely be using Humbird Visuals for future projects!',
          response: null,
          responseDate: null,
        },
        {
          id: 13,
          reviewer: 'William Rudolph',
          rating: 5,
          date: 'a year ago',
          text: 'These guys are fantastic. Their dynamic drone and video shooting skills are top-notch and can capture any environment to great effect. They are quick, deliberate, and professional. We had them out to my brewery to capture footage in a tight space and they did an amazing job. The final product was exactly what we needed for our marketing materials. I highly recommend Humbird Visuals for any aerial photography or videography needs!',
          response: 'Thank you William! Loved the atmosphere at RoundTrip.',
          responseDate: 'a year ago',
        },
        {
          id: 14,
          reviewer: 'Joe Teti',
          rating: 5,
          date: 'a year ago',
          text: 'What a professional experience! I was looking for something that was going to fit my budget and I am still blown away! You tell Eric what you are looking for and he creates it for you. I used him for some media that we use at Greystar and the footage is exactly what we needed. I highly recommend Humbird Visuals for any aerial photography or videography needs!',
          response: null,
          responseDate: null,
        },
        {
          id: 15,
          reviewer: 'Diego Herrera',
          rating: 5,
          date: '8 months ago',
          text: 'Eric was very professional and went above and beyond for the project, definitely will be hiring again for future projects',
          response:
            'Hey Diego, Thank you for taking the time to share your experience. It was a pleasure working with you and team. Cheers!',
          responseDate: '8 months ago',
        },
        {
          id: 16,
          reviewer: 'Kian Momeni',
          rating: 5,
          date: 'a year ago',
          text: 'Eric is awesome and it was a pleasure working with him! Incredibly professional and the final product was amazing!',
          response: 'Thank you Kian! it was a pleasure',
          responseDate: 'a year ago',
        },
        {
          id: 17,
          reviewer: 'Kyle Vick',
          rating: 5,
          date: 'a year ago',
          text: 'Working with this team was a breeze! The final product looked AMAZING!',
          response: null,
          responseDate: null,
        },
        {
          id: 18,
          reviewer: 'Dee Rich 100',
          rating: 5,
          date: 'a year ago',
          text: 'From start to finish, the experience was seamless and professional.',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 9,
      name: 'American Drone Industries',
      location: 'Atlanta, GA',
      address: '541 10th St NW #225, Atlanta, GA 30318',
      phone: '(404) 382-8010',
      website: 'americandroneindustries.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 18,
      status: 'active',
      notes:
        'American Drone Industries is a premier drone filming and photography company, providing stunning aerial footage for a variety of industries. With cutting-edge technology and experienced pilots, we specialize in capturing unique perspectives and creating high-quality content. Founded in 2013, ADI is a proud member of the International Cinematographers Guild, Part 107 pilot, Section 333 exempt, FAA Night Waiver & insured.',
      services:
        'Aerial Architecture Photography, Aerial Drone Filming, Aerial Footage, Aerial Perspective, Aerial Photography & Videography, Aerial Photos Drone, Aerial Pictures, Aerial Shots, Aerial Videos, Color Grading, Construction Planning, Corporate Events, Corporate Video, Drone Filming Film, Drone Filming Photography, Drone Footage, Drone Photography Commercial, Drone Pilot Training, Drone Videos, Drones 3d Modeling, Drones Photogrammetry, Event Filming, Events Aerial Photography, Film Production, Part 107 Training, Photogrammetry/3d Modeling, Post-Production, Private Events, Special Events, Video Editing, Website Design',
      yearsInBusiness: 7,
      reviews: [
        {
          id: 1,
          reviewer: 'Monica McCoy',
          rating: 5,
          date: '8 months ago',
          text: "I called this company, hoping that they repair drones. While they do not, Elliot gave me a great recommendation for another drone, as well as some advice to repair my current one. He even logged onto Amazon to make sure he was recommending the right drone for me. He's a very nice person and I appreciate his advice!",
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'Deborah McGarry',
          rating: 5,
          date: '2 years ago',
          text: 'Such a pleasant experience all the way around! They were quick to respond to my call, professional, easy to work with, and the results of their work where phenomenal. My neighborhood needed documentation of the natural areas, and the aerial footage they captured was exactly what we needed. Highly recommend!',
          response: 'Thank you Deborah!',
          responseDate: '2 years ago',
        },
        {
          id: 3,
          reviewer: 'Kat Proano',
          rating: 5,
          date: '7 years ago',
          text: 'I hired American Drone Industries about 2 weeks ago. I recieved our final product today from Elliot and I am so happy with the results. They went above and beyond to get the perfect shots. Very affordable and great people to work with. Our company will be working with them in the future.',
          response: 'Thank You!',
          responseDate: '7 years ago',
        },
        {
          id: 4,
          reviewer: 'Mike Tims',
          rating: 5,
          date: '7 years ago',
          text: 'Great company to work with. Very professional and knowledge. They produced, created the script and were able to shoot on the tough time schedule my company provided. Even with changes throughout the process, American Drone Industries was able to adapt and deliver a high-quality product that exceeded our expectations.',
          response: 'Thank you Mike! It was our pleasure to work with your team!',
          responseDate: '7 years ago',
        },
        {
          id: 5,
          reviewer: 'Debby Myers',
          rating: 5,
          date: '2 years ago',
          text: "American Drone Industries provided personalized training and I would highly recommend them. I took group classes before the pandemic and forgot most of what I'd learned. The group class was an all day class for beginners. The actual flying time was minimal and I didn't feel confident. Elliot provided one-on-one training that was tailored to my needs and experience level. He was patient, knowledgeable, and helped me build confidence in my flying skills. The training was worth every penny!",
          response: null,
          responseDate: null,
        },
        {
          id: 6,
          reviewer: 'Michael Lawler',
          rating: 5,
          date: 'a year ago',
          text: 'Elliott is a great guy. I hope everyone who sees this review gets the opportunity to do business with him.',
          response: null,
          responseDate: null,
        },
        {
          id: 7,
          reviewer: '19 Is the Number',
          rating: 5,
          date: '5 years ago',
          text: 'It was so easy working with American Drones. There patience and attention to detail makes the finish product truly successful. I would recommend them and plan to use their services on future aerial shoots.',
          response: 'Thank you so much!',
          responseDate: '5 years ago',
        },
        {
          id: 8,
          reviewer: 'Pat DeGrace',
          rating: 5,
          date: '7 years ago',
          text: 'I had a wonderful experience with American Drone Industries. They were the first of the three vendors I called to return my call. They came when they said they would and the photos were exactly what we wanted. Highly recommended!',
          response: 'Thank you Pat!',
          responseDate: '7 years ago',
        },
        {
          id: 9,
          reviewer: 'Spam Acct',
          rating: 5,
          date: 'a year ago',
          text: '🟥 ADI is the 🐐. GOAT. Best drone pilot in the south. Why? 10+ yrs. Precision + Expertise + ❤️ = The best. Period. ⚫️',
          response: null,
          responseDate: null,
        },
        {
          id: 10,
          reviewer: 'Lilburn Tires',
          rating: 5,
          date: 'a year ago',
          text: 'best ever. he walk me thru my setting and help me out thanks alot',
          response: null,
          responseDate: null,
        },
        {
          id: 11,
          reviewer: 'Emily Fulton',
          rating: 5,
          date: '2 years ago',
          text: 'Wonderful and informative time! Elliot is very knowledgeable and patient with new pilots.',
          response: null,
          responseDate: null,
        },
        {
          id: 12,
          reviewer: 'Kathleen Mathews',
          rating: 5,
          date: '7 years ago',
          text: 'Fun experience using facebook live to watch the drone in action and it allowed them to follow my direction to get the exact photos we needed. Will definitely use again!',
          response: 'Thank you!',
          responseDate: '7 years ago',
        },
        {
          id: 13,
          reviewer: 'Ramsey Yount',
          rating: 5,
          date: '2 years ago',
          text: 'Top notch! Very professional, I would totally hire them again.',
          response: null,
          responseDate: null,
        },
        {
          id: 14,
          reviewer: 'Carl Seville',
          rating: 5,
          date: '2 years ago',
          text: 'Professional, comprehensive training on how to pilot a drone.',
          response: null,
          responseDate: null,
        },
        {
          id: 15,
          reviewer: 'Casey',
          rating: 5,
          date: '9 months ago',
          text: 'Excellent!',
          response: null,
          responseDate: null,
        },
        {
          id: 16,
          reviewer: 'Issac Maltz יצחק מלץ',
          rating: 5,
          date: '4 years ago',
          text: 'Great',
          response: null,
          responseDate: null,
        },
        {
          id: 17,
          reviewer: 'Lynette Johnson',
          rating: 5,
          date: '10 months ago',
          text: 'Very professional and knowledgeable about battery life I had left on screen. Bringing the drone back safely in time. Much focus was on safety for the drone and the public. Sorry this is so long, I should edit this review.',
          response: null,
          responseDate: null,
        },
        {
          id: 18,
          reviewer: 'Chris Nelson',
          rating: 5,
          date: '2 years ago',
          text: 'Very affordable and great people to work with.',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 10,
      name: '0 to 400 Drone Services',
      location: 'Canton, GA',
      address: 'Canton, GA 30114',
      phone: '(719) 588-8214',
      website: '0to400droneservices.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 13,
      status: 'active',
      notes:
        'Licensed Part 107 Pilot and Insured up to 1 Million Dollars for Drone Flights. Independent Inspections you can trust! Free Consultation. Commercial Roof Inspections. Thermography Inspections of Flat Roof Systems. Identifies as veteran-owned.',
      services:
        'Commercial photography, Corporate photography, Real estate photography, 3D Models, Aerial Photos, Commercial Drone Pilot, Commercial Roof Inspections, Fpv Drones, Orthomosaic Photography, Thermal Inspection, Videography, Visual Inspections, Commercial Roof Inspection, Lost Pet Search, Orthomosaic Image, Water Intrusion Inspections',
      yearsInBusiness: 3,
      reviews: [
        {
          id: 1,
          reviewer: 'Alyssa Bulostin',
          rating: 5,
          date: '3 months ago',
          text: 'Ryan helped us catch our flighty puppy and truly went above and beyond calling for outside advice and ideas when we were on our wild goose chase. The gps collar helped to locate, but Ryan is what allowed us to finally catch her and bring her home safely.',
          response:
            'Thank you so much for your kind words. You guys did great taking everything slow and following the process. We are happy your family is whole again.',
          responseDate: '3 months ago',
        },
        {
          id: 2,
          reviewer: 'Jorden Hendon',
          rating: 5,
          date: '3 months ago',
          text: "My dog ran off at 1am I couldn't find her anywhere I searched the next day still no luck. I messaged and they messaged back very quickly to be of service. Got to my home at 5:30 and found her by 6:30 near a creek wrapped in Brier's. So thankful for their help!",
          response:
            "I'm glad we had such a happy ending. Considering the age and the approaching weather we had to jump in on this one for sure.",
          responseDate: '3 months ago',
        },
        {
          id: 3,
          reviewer: 'Mike curry',
          rating: 5,
          date: '11 months ago',
          text: 'Very impressive! Ryan and his wife helped us locate our dog that had been missing for 48 hours. We never would have found him without their help. Very nice people, reasonably priced.',
          response:
            'We are happy to help and glad Leo is home safe with his family. Thank you so much for the amazing review!',
          responseDate: '11 months ago',
        },
        {
          id: 4,
          reviewer: 'Kennady Davis',
          rating: 5,
          date: '10 months ago',
          text: "LIFE SAVERS!!!! We lost our puppy in downtown jasper for over 24 hours and this wonderful couple came to our rescue!! Ryan and his wife were so helpful in communicating what was going on and what would be happening, and he led us right to our fur baby. We couldn't have asked for a better company to help us find her!!",
          response: null,
          responseDate: null,
        },
        {
          id: 5,
          reviewer: 'Jonathan Vaughn',
          rating: 5,
          date: 'a year ago',
          text: 'Great experience! We used these guys to help find a puppy that went missing Friday night. The response time (both by phone & onsite arrival) was amazing for my after-hours needs. Equipment was impressive to watch fly and thermal imaging is a game changer for finding lost pets. Highly recommend!',
          response:
            'Thank you so much for the amazing review. We hope to keep that same level of dedication and customer service as we expand and grow.',
          responseDate: 'a year ago',
        },
        {
          id: 6,
          reviewer: 'Emily Rottner',
          rating: 5,
          date: 'a year ago',
          text: "I'm thrilled to share a five-star review for 0 to 400 Drone Company. Ryan's kindness and trustworthiness played a pivotal role in reuniting us with our pup. He's truly an angel, and we highly recommend his services to everyone. Thank you, Ryan, for helping bring our puppy home – we appreciate you immensely!",
          response: "I'm glad I was able to help in getting him back safely and quickly.",
          responseDate: 'a year ago',
        },
        {
          id: 7,
          reviewer: 'Jessica Albano Foster',
          rating: 5,
          date: '10 months ago',
          text: 'Great experience using 0-400 Drone Services to help find our lost cat. Ryan came out the same day and was very professional. Highly recommend.',
          response: null,
          responseDate: null,
        },
        {
          id: 8,
          reviewer: "C'est la Vie GA",
          rating: 5,
          date: 'a year ago',
          text: 'Ryan came as fast as he can when someone called me to tell me he may have seen my dog. It was freezing and almost night but he spent almost 2 hours to look for my dog. Very friendly and helpful.',
          response: null,
          responseDate: null,
        },
        {
          id: 9,
          reviewer: 'BLAKE HAUGER',
          rating: 5,
          date: '9 months ago',
          text: 'This company has been amazing. I use them for all of our thermal projects. Ryan is always quick to respond, and extremely professional. Highly recommended!',
          response: null,
          responseDate: null,
        },
        {
          id: 10,
          reviewer: 'Dakota Wright',
          rating: 5,
          date: 'a year ago',
          text: 'I called them to help me locate a leak in my apartment. With his help our property management company was able to complete the repair quickly.Thank you!',
          response: null,
          responseDate: null,
        },
        {
          id: 11,
          reviewer: 'Celeste Freeman',
          rating: 5,
          date: 'a year ago',
          text: 'Quick to get to us and very compassionate. His knowledge was very appreciated.',
          response: null,
          responseDate: null,
        },
        {
          id: 12,
          reviewer: 'paul dupre',
          rating: 5,
          date: '9 months ago',
          text: 'Responsive, knowledgeable, customer focused & friendly',
          response: null,
          responseDate: null,
        },
        {
          id: 13,
          reviewer: 'Justin B',
          rating: 5,
          date: '2 years ago',
          text: 'Great service and very professional. Would recommend to anyone needing drone services.',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 11,
      name: 'Drone Pilot Georgia, LLC.',
      location: 'Georgia',
      address: 'Georgia',
      phone: '(833) 376-6342',
      website: 'dronepilotgeorgia.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 14,
      status: 'active',
      notes:
        'Fully licensed and insured drone pilot services for aerial photography, and Part 107 test preparation for commercial services in accordance with Federal Aviation Administration policy. We also work with media professionals. Core competencies are aerial photography, videography, and pilot training.',
      services:
        '3D Drone Mapping, 3d Mapping, Aerial Cinematography, Aerial Data Collection, Aerial Photography Drone, Certified Drone Pilots, Commercial Aerial Photography, Commercial Drone Pilot, Commercial Real Estate, Construction Inspections, Construction Site Surveys, Disaster Relief Services, Drone Data, Drone Flight, Drone Mapping, Drone Pilot Training, Event Photography, Flight Training, Interior And Exterior Images, Land Surveying, Motion Picture and Video Production, Night Flight, Part 107 Faa Certification, Part 107 Training, Project Management, Property Management, Property Surveying, Real Estate Photography, Remote Pilots, Roof Inspections, Structure Inspections, Training Course, Unmanned Aircraft, Utility Inspections, Video Editing, Video Production',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Aliza Friedman',
          rating: 5,
          date: '11 months ago',
          text: 'Jack was great! He came to take the photos I needed on short notice and accommodated my timing, which was super helpful! He also took beautiful photos and had them in my inbox very quickly! Would definitely use this service again. Thank you!',
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'v smith',
          rating: 5,
          date: '4 years ago',
          text: 'Drone Pilot Georgia put forth a great effort in their FAA Drone Certification Training. I was provided with all of the material needed to prepare for and pass my Part 107 test. They were well prepared and reachable in the need of any questions.',
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'Stacey Thibodeaux',
          rating: 5,
          date: '4 years ago',
          text: 'Drone Pilot Georgia has always been able to get me scheduled right away so that I can get my listings on the market quickly. The pilots are patient and creative and were able to get that "just right" angle of my properties. One of my favorite vendors!',
          response: null,
          responseDate: null,
        },
        {
          id: 4,
          reviewer: 'Darrin Bucknor',
          rating: 5,
          date: '4 years ago',
          text: 'They have a wonderful team. I know Shawn Jones personally he provided all information about the company understandable. I am more interested about flying drones because of him.',
          response: null,
          responseDate: null,
        },
        {
          id: 5,
          reviewer: 'Andrew Wells',
          rating: 5,
          date: '4 years ago',
          text: 'The Drone Pilot LLC team is thoughtful, responsive and provides a great, hands-on, learn by doing teaching approach that could lead to certification in an in-demand skill. I also appreciate their willingness to partner with organizations to support local communities and youth. By the way they take great aerial photos!',
          response: null,
          responseDate: null,
        },
        {
          id: 6,
          reviewer: 'zfloehle',
          rating: 5,
          date: '4 years ago',
          text: 'Available, dependable and very good quality services. I have worked with the Drone Pilot Georgia team on a variety of projects in a variety of settings (from on top of a local mountain to a groundbreaking event and more) and they are always professional and deliver great results.',
          response: 'Thank you! As always your feedback is appreciated.',
          responseDate: '4 years ago',
        },
        {
          id: 7,
          reviewer: 'Bette Maloy',
          rating: 5,
          date: '3 years ago',
          text: 'Drone Pilot Georgia was incredibly professional, responsive, and informative. They answered all questions pertaining to the Part 107 study course and exam, and assisted in setting up exam dates for me and my colleagues. Every participant in our group passed the exam on the first try!',
          response:
            "Thank you so much for that awesome review and the opportunity to once more serve the City of Atlanta. If ever you need anything or have any questions just reach out. We're always here to help.",
          responseDate: '3 years ago',
        },
        {
          id: 8,
          reviewer: 'Kandice Perkins',
          rating: 5,
          date: '2 years ago',
          text: 'This was a great experience! Quick turn around, very professional and excellent quality! Shawn captured my vision to perfection! Will absolutely use Drone Pilot Georgia again and again!!',
          response:
            'Thanks Kandice! We look forward to serving your future real estate photography needs in Central and South Florida. We pride ourselves in delivering the best all around client experience.',
          responseDate: '2 years ago',
        },
        {
          id: 9,
          reviewer: 'Jestacia Jones',
          rating: 5,
          date: '4 years ago',
          text: 'Thank you for mentoring our tech engineers- future drone pilots. An experience they will never forget.',
          response: null,
          responseDate: null,
        },
        {
          id: 10,
          reviewer: 'QUINCEY MCNAIR',
          rating: 5,
          date: '4 years ago',
          text: 'My first time experience with drone pilot was awesome!!! Very professional and dependable. I will definitely use them again.',
          response: null,
          responseDate: null,
        },
        {
          id: 11,
          reviewer: 'Diamond N.',
          rating: 5,
          date: '4 years ago',
          text: 'Amazing company that also contributes to community programs',
          response: null,
          responseDate: null,
        },
        {
          id: 12,
          reviewer: 'Revonda Cosby',
          rating: 5,
          date: '4 years ago',
          text: 'Great service and very professional. Would recommend to anyone needing drone services.',
          response: null,
          responseDate: null,
        },
        {
          id: 13,
          reviewer: 'Rafiq Ahmad',
          rating: 5,
          date: '4 years ago',
          text: 'Excellent service and very knowledgeable team. They helped me prepare for my Part 107 exam and I passed on the first try!',
          response: null,
          responseDate: null,
        },
        {
          id: 14,
          reviewer: 'edwina328',
          rating: 5,
          date: '4 years ago',
          text: 'Drone Pilot Georgia provided excellent aerial photography for our real estate listings. The quality was outstanding and the turnaround time was quick. Highly recommend!',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 11,
      name: 'Brilliance Photography and Drone Services',
      location: 'Atlanta, GA',
      address: 'Atlanta, GA',
      phone: '(404) 555-0123',
      website: 'brilliancephotography.com',
      linkedin: '',
      rating: 4.8,
      reviewCount: 25,
      status: 'active',
      notes:
        'Professional photography and drone services specializing in real estate, commercial, and aerial photography. FAA Part 107 certified pilots with extensive experience in capturing stunning aerial footage.',
      services:
        'Real estate photography, Aerial photography, Commercial photography, Drone videography, Property inspections, Construction site documentation, Event photography, Architectural photography, Interior photography, Virtual tours',
      yearsInBusiness: 6,
      reviews: [
        {
          id: 1,
          reviewer: 'Michael Thompson',
          rating: 5,
          date: '2 months ago',
          text: 'Brilliance Photography did an amazing job with our property listing. The aerial shots were breathtaking and helped us sell the property quickly.',
          response:
            "Thank you for your kind words, Michael! We're glad we could help showcase your property effectively.",
          responseDate: '2 months ago',
        },
        {
          id: 2,
          reviewer: 'Sarah Williams',
          rating: 5,
          date: '3 months ago',
          text: 'Professional team, excellent communication, and high-quality photos. Would definitely recommend their services.',
          response:
            'Thanks Sarah! We appreciate your business and look forward to working with you again.',
          responseDate: '3 months ago',
        },
        {
          id: 3,
          reviewer: 'David Chen',
          rating: 4,
          date: '4 months ago',
          text: 'Great service overall. The drone footage was impressive, though delivery took a bit longer than expected.',
          response:
            "Thank you for your feedback, David. We're working on improving our delivery times.",
          responseDate: '4 months ago',
        },
        {
          id: 4,
          reviewer: 'Jennifer Martinez',
          rating: 5,
          date: '5 months ago',
          text: 'The team at Brilliance Photography is incredibly professional and talented. They captured our property beautifully.',
          response: "Thank you Jennifer! We're thrilled you're happy with the results.",
          responseDate: '5 months ago',
        },
        {
          id: 5,
          reviewer: 'Robert Johnson',
          rating: 5,
          date: '6 months ago',
          text: 'Outstanding aerial photography services. The quality of their work is consistently excellent.',
          response: 'Thanks Robert! We appreciate your continued business.',
          responseDate: '6 months ago',
        },
      ],
    },
    {
      id: 12,
      name: 'FlyWorx Drone & Media Services',
      location: 'Atlanta, GA',
      address: '1 Glenlake Pkwy NE Suite 650, Atlanta, GA 30328',
      phone: '(844) 359-9679',
      website: 'flyworx.co',
      linkedin: 'linkedin.com/company/flyworx-drone-cre-media-services',
      rating: 4.6,
      reviewCount: 10,
      status: 'active',
      notes:
        'FlyWorx - Atlanta Georgia Drone Services Company is a nationwide commercial drone services provider. FlyWorx offers industry leading aerial tools and processes to help enterprises extract and derive value from drone data.',
      services:
        'Corporate photography, Real estate photography, Aerial Photography, Drone Photography, Drone Photos, 3d Model, Aerial Data Collection, Aerial Drone Company, Aerial Drone Inspections, Aerial Mapping, Aerial Photography & Video, Aerial Shots, Aerial Uav Services, Asset Inspections, Bridge Inspections, Building Inspection, Building Inspections, Cell Tower Inspections, Commercial Drone Operations, Commercial Drone Services, Commercial Real Estate Aerial Photography, Construction Drone Mapping, Construction Inspections, Consulting Services, Custom Drone Services, Data Analysis, Data Processing, Drone, Drone Aerial Photography, Drone Aerial Video, Drone Cell Tower inspections, Drone Commercial Real Estate Packages, Drone Company, Drone Film & TV Packages, Drone Inspections, Drone Mapping, Drone Photography & Video, Drone Program, Drone Tech, Drone Technology, Drone Water Tower Inspections, Film & Tv, FlyWorx, Flying Drones, GIS, Photogrammetry Mapping Services, Image Processing, Industrial Inspections, Infrastructure Inspections, Licensed Drone Pilots, Marketing Campaigns, Media Services, Photo And Video, Pipeline Inspections, Post-Production, Power Line Inspections, Real Estate Drones, Real Estate Marketing, Residential & Commercial, Residential Real Estate, Software Development, UAS, UAV, Video Marketing, Visual Inspections, Commercial Property Tours, Commercial Real Estate Marketing, Industrial Property Tours, Multifamily Property Tour, Office Virtual Tour, Virtual Property Tour, Virtual Property Video, Virtual Property Walkthrough, Commercial Roof Inspection, Drone Building Inspections, Roof Inspection, Film & TV Production, Interviews and Photos, Video Production, GIS, Orthomosaic, Photogrammetry, Video Editing, Video Post Production',
      yearsInBusiness: 10,
      reviews: [
        {
          id: 1,
          reviewer: 'George Tsioutsioulas',
          rating: 5,
          date: '5 years ago',
          text: 'I approached Flyworx to capture some aerial footage over a 10 day period. Due to issues beyond our control, that shoot became a much longer project. I needed a crew that was flexible and able to deal with last minute issues. Thankfully, they were up to the task.',
          response:
            'George, thank you for your kind words and allowing us to be part of this exciting proejct!',
          responseDate: '5 years ago',
        },
        {
          id: 2,
          reviewer: 'Kris Pinto',
          rating: 1,
          date: '3 years ago',
          text: 'I hired FlyWorx to document a home renovation with 3 distinct phases: pre-construction, midway through and after the project was completed. I had to pay for the services prior to them shooting the footage. I have been unsuccessful in getting them to complete the project.',
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'Megan Northmarq',
          rating: 5,
          date: '5 years ago',
          text: 'Roman and his team were awesome to work with on a recent project. We gave them limited timing and limited direction, but they totally delivered. Will absolutely hire them again for our next project. Thanks guys!!',
          response: 'Thank you Megan!',
          responseDate: '5 years ago',
        },
        {
          id: 4,
          reviewer: 'Dennis Molla',
          rating: 5,
          date: '5 years ago',
          text: 'We are really impressed with Romans flying skills and at the same time capturing beautiful shots. We highly recommend Roman and his team to anyone looking to up their game from the sky!',
          response: 'Thank you Dennis! We appriciate your business!',
          responseDate: '5 years ago',
        },
        {
          id: 5,
          reviewer: 'Andrew Fernandez',
          rating: 5,
          date: '5 years ago',
          text: 'Very friendly and professional! We look forward to working with them again!',
          response: 'Thank you for your help!',
          responseDate: '5 years ago',
        },
        {
          id: 6,
          reviewer: 'Val Zavo',
          rating: 5,
          date: '2 years ago',
          text: 'Great service and quality video production',
          response: 'Thank you Val!',
          responseDate: '2 years ago',
        },
        {
          id: 7,
          reviewer: 'Kristina Kharlova',
          rating: 5,
          date: '5 years ago',
          text: '',
          response: 'Thank you Kristina!',
          responseDate: '5 years ago',
        },
        {
          id: 8,
          reviewer: 'Derron Miller',
          rating: 5,
          date: '5 years ago',
          text: '',
          response: 'Thank you Derron, much appreciated!',
          responseDate: '5 years ago',
        },
        {
          id: 9,
          reviewer: 'Dmitriy Molla',
          rating: 5,
          date: '5 years ago',
          text: '',
          response: 'Thank you Dmitriy!',
          responseDate: '5 years ago',
        },
        {
          id: 10,
          reviewer: 'Emma Wilson',
          rating: 5,
          date: '5 years ago',
          text: '',
          response: 'Thank You Emma!',
          responseDate: '5 years ago',
        },
      ],
    },
    {
      id: 13,
      name: "Robert's Drone Zone",
      location: 'Georgia',
      address: 'Georgia',
      phone: '(313) 403-7663',
      website: 'robertsdronezone.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 11,
      status: 'active',
      notes:
        "Surpass your visual boundaries with Robert's Drone Zone Georgia. Operating within the state of Georgia, we offer exceptional drone photography, transforming ordinary perspectives into breathtaking aerial art. Serving as both creative drone pilots and professional photographers. Identifies as disabled-owned and veteran-owned.",
      services:
        'Corporate photography, Events and parties, Family and group, Real estate photography, Wedding and engagement, Aerial Event Photography, Aerial Photographs, Aerial Photography And Videography, Book Appointment, Construction Progress, Corporate Events, Drone Photo, Event Photography & Video, Event Promotion, Group Photos, Livestock Lost or Missing Search, Lost Pet Search, Outdoor Weddings, Property Listing, Real Estate Listing, Real Estate Photo, Residential Real Estate, Resolution Video, Search and Rescue, Social Media Commercials, Special Event, Thermal Drone Service, Video Montage, Video Tour, Video Video, Wedding Proposal',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Danielle Hinson Moore',
          rating: 5,
          date: '1 month ago',
          text: 'Robert is absolutely amazing to work with and does exemplary work! He was extremely flexible, had a good sense of urgency, and took great care of our particular project. He even provided a summary of exactly what we wanted footage of on the day of the shoot.',
          response:
            "Thank you so much for the kind words as it was a pleasure to help you capture all that you were looking to achieve. We'll be here and ready to help out in the future as your needs arise to capture extraordinary from above!!",
          responseDate: '1 month ago',
        },
        {
          id: 2,
          reviewer: 'Brian Tatum',
          rating: 5,
          date: '6 months ago',
          text: "Robert has a great attention to detail and is extremely client focused. He's very knowledgeable and responsive and is an expert in his craft! Will definitely use him again!",
          response:
            "Thanks for the review. We're here and ready to help you with your next property.",
          responseDate: '6 months ago',
        },
        {
          id: 3,
          reviewer: 'Norma Shohet',
          rating: 5,
          date: '3 months ago',
          text: 'Robert is very professional and went out of his way to help us look for a lost dog. He is timely and conscientiousness and thorough!',
          response: 'Thank you for the 5 star review. Happy to have helped out. Happy New Year!!',
          responseDate: '3 months ago',
        },
        {
          id: 4,
          reviewer: 'Pinnacle PRS',
          rating: 5,
          date: '8 months ago',
          text: 'Just want to say that I saw firsthand what an experienced drone pilot looks like today on one of my job sites! Robert came out and did a fantastic job shooting the aerial shots I needed for my project. He arrives on time and on schedule, and I was very impressed with his professionalism and expertise.',
          response: 'Thank you for the kind words and I look forward to many more projects ahead.',
          responseDate: '8 months ago',
        },
        {
          id: 5,
          reviewer: 'adam riley',
          rating: 5,
          date: '9 months ago',
          text: 'Robert was extremely professional and well versed in his field. He studied the area beforehand and had a game plan upon arrival. He searched the area extensively and decided given the conditions that the best plan was to come back once the weather improved. He was right and found my dog the next day!',
          response:
            'Thank you for the kind words. I was happy to be of help in your time of need and the best part was hearing she was back home.',
          responseDate: '9 months ago',
        },
        {
          id: 6,
          reviewer: 'Robin Allgood',
          rating: 5,
          date: '4 months ago',
          text: 'Very accommodating. Robert came out immediately and did a great job!',
          response: 'Happy to help.',
          responseDate: '4 months ago',
        },
        {
          id: 7,
          reviewer: 'Christopher DeOliveira',
          rating: 5,
          date: '3 years ago',
          text: 'I contacted Robert for the drone services that he offers. He was very responsive with messaging and we were able to pick a time that met my schedule. Robert will do all the necessary research before hand to make sure that he can do the fly over and get the shots that you need. He is very professional and I would recommend his services to anyone looking for drone photography or videography.',
          response: null,
          responseDate: null,
        },
        {
          id: 8,
          reviewer: 'Clark Griswold',
          rating: 5,
          date: '3 years ago',
          text: "For the first time ever I decided to drone coverage of my Christmas display this year and I found Robert on Facebook and fortunately for me Robert was very responsive to my emails very professional fair pricing and did a great job!! Robert captured my display perfectly and I couldn't be happier with the results!!",
          response:
            'Thanks for the kind words. It was an honor to help you capture such a beautiful light display. Your hard work and passion shows.',
          responseDate: '3 years ago',
        },
        {
          id: 9,
          reviewer: 'JR Walker',
          rating: 5,
          date: '8 months ago',
          text: "Timely, does what he says he will do. I recommend this company to anyone needing this type of service. Did I mention he's the most reasonable around, trust me I checked",
          response: 'Thank you for the great review. I was happy to help you out.',
          responseDate: '8 months ago',
        },
        {
          id: 10,
          reviewer: 'Christy Wyatt',
          rating: 5,
          date: '2 years ago',
          text: 'Mr. Robert got some amazing shots and video of our event! He is an amazing person as well! I will be using him again for future events.',
          response:
            "It was a pleasure to help you with your project. Thank you for your kind words and we'll be here and ready to assist you with your next event.",
          responseDate: '2 years ago',
        },
        {
          id: 11,
          reviewer: 'Cortez Dudley',
          rating: 5,
          date: '3 years ago',
          text: '',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 14,
      name: 'ODI ENGINEERING|Drone Services',
      location: 'Atlanta, GA',
      address: '3280 Peachtree Rd, Atlanta, GA 30305',
      phone: '(470) 485-4138',
      website: 'odiengineering.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 6,
      status: 'active',
      notes:
        "With ODI, you can trust that you're getting the highest quality of drone services possible. Our drone pilots are experienced in a wide range of industries, including real estate, construction, agriculture, public safety and more, providing customized solutions for each client's unique needs.",
      services:
        'AGRICULTURE, SECURITY, CONSTRUCTION, SEARCH/RESCUE, ROOFING INSPECTIONS, ENERGY INFRASTRUCTURE, EVENTS',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Dessert Junkie',
          rating: 5,
          date: '1 year ago',
          text: 'These guys are awesome! I have a large property that is difficult to secure but ODI came out and made it much more manageable with their drone security service. The drones they use are able to fly over my property and take high-definition footage that helps me monitor everything from a safe distance.',
          response: "Glad we were able to help! As always, it's our pleasure to serve you. 🛸",
          responseDate: '1 year ago',
        },
        {
          id: 2,
          reviewer: 'Sean Christian II',
          rating: 5,
          date: '1 year ago',
          text: "ODI has proven to be an invaluable partner for security operations with professional pilots and high tech drones providing moment to moment information from an Eagle's eye view. I highly recommend ODI for any professional surveillance needs.",
          response: 'Thanks! Protecting people and assets is what we do..🛸',
          responseDate: '1 year ago',
        },
        {
          id: 3,
          reviewer: 'Mario Marius',
          rating: 5,
          date: '6 months ago',
          text: 'I am thoroughly impressed with the exceptional service provided by the company. Upon receiving their assistance, I am truly grateful and would wholeheartedly endorse their services without hesitation.',
          response:
            "Thank u for allowing us to serve you! We're pleased to hear that you are happy with the quality of services provided.",
          responseDate: '6 months ago',
        },
        {
          id: 4,
          reviewer: 'Daniela Argumedo',
          rating: 5,
          date: '6 months ago',
          text: 'I would recommend to anyone needing drone services, whether for inspections, promotions or creative projects. I will certainly use your service again in the future.',
          response: 'Thank you for choosing ODI',
          responseDate: '6 months ago',
        },
        {
          id: 5,
          reviewer: 'Terrence Jackson',
          rating: 5,
          date: '1 year ago',
          text: 'This is our aerial oversight team and when we out they up and out watching, catching and seeing it all. My guy Feaz',
          response:
            'Thanks for allowing us to serve you! Protecting people and assets is top priority at ODI',
          responseDate: '1 year ago',
        },
        {
          id: 6,
          reviewer: 'carolina gomez',
          rating: 5,
          date: '2 years ago',
          text: '',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 15,
      name: 'Airmazing Drone and Media Services',
      location: 'Gwinnett Place, GA',
      address: 'Gwinnett Place, GA',
      phone: '(678) 590-0108',
      website: 'airmazingdrones.com',
      linkedin: 'linkedin.com/company/airmazing-drone-media-services',
      rating: 5.0,
      reviewCount: 13,
      status: 'active',
      notes:
        'We offer stunning aerial photography and videography for real estate, events, and businesses, capturing high-quality visuals with expert precision. Started by Chief Visionary Officer Everald Henry, Airmazing Drone & Media Services has been capturing breathtaking aerial visuals for diverse industries. Identifies as Black-owned and veteran-owned.',
      services:
        '3D Mapping, 3d Mapping 3d Mapping, Aerial Filming, Aerial Footage, Aerial Photograph & Videography, Aerial Photography, Aerial Photography & Videography, Aerial Photography And Video, Aerial Surveying Services, Building Inspection, Drone Inspection, Drone Solutions, Drone Technology, Drone Videography, Drone survey, Drones Pilots, Film & Tv, Film Production, Film and Television, Media Services, Photos And Videos, Pictures And Videos, Project Monitoring, Real Estate Photography',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Christopher Terrell',
          rating: 5,
          date: '5 months ago',
          text: 'Was an absolute pleasure to work with Airmazing. Arrived on time, provided a detailed plan of what they were going to do, and exceeded my expectations. Will most certainly recommend and utilize again.',
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'nakeita smith',
          rating: 5,
          date: '6 months ago',
          text: 'I had a great experience working with Airmazing Drone for a recent project. They are highly professional and took the time to understand my specific needs. The aerial shots they captured were stunning and exceeded my expectations in terms of quality and creativity.',
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'Leta Sims',
          rating: 5,
          date: '5 months ago',
          text: "I have been fortunate to collaborate with Everald of Airmazing Drone and Media Services on several projects. I am reminded of my 1st desperate encounter with Everald. .. Another drone tech that I'd booked cancelled on me last minute for a wedding. Everald stepped in and saved the day! He was professional, punctual, and delivered amazing footage. Since then, we've worked together on numerous projects, and he's always exceeded expectations.",
          response:
            "\"Thank you so much, Leta! Working with you and the talented team at newNsight Photography has been an incredible experience. I'm so glad I could step in and help make that wedding day special for the bride and groom, and it's been a pleasure collaborating on so many projects since. Your commitment to delivering top-notch service aligns perfectly with my own values, and I truly appreciate the trust you've placed in me. Looking forward to many more amazing projects together!\"",
          responseDate: '5 months ago',
        },
        {
          id: 4,
          reviewer: 'Andre lewis',
          rating: 5,
          date: '6 months ago',
          text: "Seems to me like this is the most reliable drone person in ATL! Thanks for being a professional and serving the people well. Looking forward to working on the new project with you and wow my customers even more. It's nice that you're a veteran like myself. There was lots in common. Keep it up.",
          response:
            'Thank you Andre for the kind words. Looking forward to our next project as well.',
          responseDate: '6 months ago',
        },
        {
          id: 5,
          reviewer: 'Shan B',
          rating: 5,
          date: '1 year ago',
          text: 'Exceptional Service...I had alot of questions about the whole vision I had and the team was very patient and went above and beyond to address all my inquiries. I would recommend this company to anyone who is looking for high quality drone services and outstanding service, you will definitely receive value for your money.',
          response: null,
          responseDate: null,
        },
        {
          id: 6,
          reviewer: 'Tinashe Henry',
          rating: 5,
          date: '1 year ago',
          text: 'I was so pleased with the service I received from this business. They went above and beyond to help me get the perfect shots for a project and communication was top tier. Definitely recommend using this company.',
          response:
            'Thank you so much for taking the time to leave such a positive review! We are thrilled to hear that you enjoyed your experience with us. Your support means a lot to us, and we look forward to serving you again in the future.',
          responseDate: '1 year ago',
        },
        {
          id: 7,
          reviewer: 'Akira T',
          rating: 5,
          date: '1 year ago',
          text: 'Outstanding performance. I would definitely use this service again. Very professional and exceptional quality of work. Gave great advice when asked about further services.',
          response: null,
          responseDate: null,
        },
        {
          id: 8,
          reviewer: 'Rhnada White',
          rating: 5,
          date: '1 year ago',
          text: 'Very detailed oriented. LOVE how he captures all that we needed. Definitely booking Amazing drone and Media again.',
          response: null,
          responseDate: null,
        },
        {
          id: 9,
          reviewer: 'richard moore',
          rating: 5,
          date: '1 year ago',
          text: 'Amazing customer service, friendly and very willing to answer any questions I had, would highly recommend.',
          response: null,
          responseDate: null,
        },
        {
          id: 10,
          reviewer: 'Carlos Henry',
          rating: 5,
          date: '1 year ago',
          text: 'Excellent service from knowledgeable staff with professional equipment',
          response: null,
          responseDate: null,
        },
        {
          id: 11,
          reviewer: 'Rennique Henry',
          rating: 5,
          date: '1 year ago',
          text: 'Excellent customer service and very reliable.',
          response: null,
          responseDate: null,
        },
        {
          id: 12,
          reviewer: 'Nicole Taruvinga',
          rating: 5,
          date: '1 year ago',
          text: 'Great service!',
          response: null,
          responseDate: null,
        },
        {
          id: 13,
          reviewer: 'Brian Daley',
          rating: 5,
          date: '1 year ago',
          text: 'Great experience',
          response: 'Thanks for taking the time out to leave a review, thank you.',
          responseDate: '1 year ago',
        },
      ],
    },
    {
      id: 16,
      name: 'Atlanta Photo & Drone',
      location: 'Decatur, GA',
      address: '3796 Austin Park Ln, Decatur, GA 30032',
      phone: '(404) 808-4994',
      website: 'atlantaphotodrone.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 9,
      status: 'active',
      notes:
        "We create stunning magazine quality photos, videos, and more for your real estate listing! Plus, we're a not-for-profit!",
      services:
        'Aerial photography, Commercial photography, Corporate photography, Events and parties, Real estate photography, Videography',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Miho Cro',
          rating: 5,
          date: '1 day ago',
          text: 'I really had nice working with him! Very professional and he listens what I need. He can effectively highlight the key selling features of the home yet accurately present the home. I have numerous complements from potential buyers and agents. Definitely recommend!',
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'Rhonda MG Williams',
          rating: 5,
          date: '2 days ago',
          text: "Atlanta Photo and Drone are the best when it comes to photography for all of your listings. They are very professional, experiences, and most of all. Very affordable! I'll be using them for all of my listings.",
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'Matthew Preston',
          rating: 5,
          date: '2 days ago',
          text: 'I recently had the pleasure of working with Atlanta Photo & Drone for a real estate listing and I could not be more impressed. The drone shots were absolutely stunning and captured every angle of the property in a way that truly made it stand out.',
          response: null,
          responseDate: null,
        },
        {
          id: 4,
          reviewer: 'Roy Rose Realtor',
          rating: 5,
          date: '2 days ago',
          text: 'Excellent service, fast and professional. Would recommend and will use again.',
          response: null,
          responseDate: null,
        },
        {
          id: 5,
          reviewer: 'Mary Pearce',
          rating: 5,
          date: '2 days ago',
          text: 'Very punctual with a comprehensive menu of services. I am very happy with the quality and range of photos/media - I happily and enthusiastically recommend!',
          response: null,
          responseDate: null,
        },
        {
          id: 6,
          reviewer: 'Jeff Claeson',
          rating: 5,
          date: '2 days ago',
          text: 'I met Jacob late last year at a Cobb Association of Realtors function. I found Jacob to be personable and knowledgeable. I hired Jacob to do a photo shoot for me and I am so glad I did. We talked about what I needed and made great plans for the shoot. The results were amazing and I got many compliments on the photos. I will definitely use Jacob again for my future listings.',
          response: null,
          responseDate: null,
        },
        {
          id: 7,
          reviewer: 'REALTOR - Kathy Radler',
          rating: 5,
          date: '2 days ago',
          text: 'Real estate photography can literally make or break a deal. When a buyer is first looking at homes online, the photography is what entices them to either want to see a home or put it on the "no" list. Jacob and Atlanta Photo and Drone is my go-to for all my listings. He is professional, timely, and produces high-quality photos that showcase my listings in the best light possible. I highly recommend his services to any realtor looking to make their listings stand out.',
          response: null,
          responseDate: null,
        },
        {
          id: 8,
          reviewer: 'Jamie Parker',
          rating: 5,
          date: '2 days ago',
          text: 'Pictures looked great and captured that the essence of the house. I appreciate his professionalism and flexibility as well.',
          response: null,
          responseDate: null,
        },
        {
          id: 9,
          reviewer: 'Ken Covers',
          rating: 5,
          date: '2 days ago',
          text: '',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 17,
      name: 'Atlanta Aerials, LLC: Drone Services',
      location: 'Atlanta, GA',
      address: 'Atlanta, GA',
      phone: '(678) 451-6942',
      website: 'atlaerials.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 3,
      status: 'active',
      notes: 'Providing Drone Videography & Photography. Certified FAA Part 107 sUAS Remote Pilot.',
      services: 'Low-Altitude Aerial Cinematography, Photography & Mapping',
      yearsInBusiness: 7,
      reviews: [
        {
          id: 1,
          reviewer: 'Landon Baize',
          rating: 5,
          date: '4 years ago',
          text: 'Daniel was very polite, professional, patient, and talented. We had a great experience and the photos and videos were top-notch. I highly recommend Atlanta Aerials, LLC for any office, corporate, or personal need when it comes to video and pictures.',
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'Michael Chandler',
          rating: 5,
          date: '5 years ago',
          text: 'Great service and a great product. Enjoyed working with them and will hire them again.',
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'Production BA',
          rating: 5,
          date: '6 years ago',
          text: '',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 18,
      name: 'WanderDrone',
      location: 'Atlanta, GA',
      address: 'Atlanta, GA',
      phone: '(770) 595-1196',
      website: 'www.wanderdrone.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 11,
      status: 'active',
      notes:
        'Aerial Photography and Videography servicing the Greater Atlanta Area. We Specialize in Real Estate (Residential and Commercial), Weddings, Film, Marketing, Advertising, and Construction, but the options are unlimited as to what we can do. We will work with you to create the perfect aerial perspective for your project.',
      services:
        'Corporate photography, Events and parties, Real estate photography, Wedding and engagement, Weddings, Advertising, Film, Inspections, Marketing, Music Videos, Photo Editing, Real Estate Videos, Wedding Videos, Aerial Perspectives, Drone Photography, Drone Videography, Photos And Videos, Post Production, Real Estate Photos, Real Estate Video, Wedding Photos',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Ashlee Therrel',
          rating: 5,
          date: '2 years ago',
          text: "It was such an awesome time working with WanderDrone! Seth took exterior pictures of our home. Showcasing the beautiful mountains and views from a drone's eye. It really was special to my husband and I. These pictures will be cherished. You can tell he loves what he does and takes pride in his work.",
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'Devon Granata',
          rating: 5,
          date: '2 years ago',
          text: 'Seth provided fair and clear pricing for some work I needed done. The turnaround time was so fast and he provided great quality in every shot and video! He was personable and easy to be around, and I love following his content to see our great state of Georgia now. 10 stars and a customer for life!',
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'Laura Josel',
          rating: 5,
          date: '3 years ago',
          text: "Seth has helped me real estate listings and I've been very happy with the results for both the still shots and video. He's professional, communicative, and has quick turnaround! Highly recommend! A+",
          response:
            "Thank you Laura! Always a great time working with you you're a pleasure to be around, you know what you're doing and you've had some beautiful listings too. Glad we could help out 😁",
          responseDate: '3 years ago',
        },
        {
          id: 4,
          reviewer: 'David Akin',
          rating: 5,
          date: '3 years ago',
          text: 'WanderDrone provided timely and very professional quality photography for us when we wanted to stage our house for sale. I highly recommend using them to get unique photography for your home or business.',
          response:
            'Thank you David! Your house is beautiful you made it easy for us 😁 always a pleasure working with you.',
          responseDate: '3 years ago',
        },
        {
          id: 5,
          reviewer: 'Monica Toth',
          rating: 5,
          date: '3 years ago',
          text: "I am a Realtor in the Roswell area with a listing that had a distinctive property in a community that is sought after. I needed something that would expose the listing from all areas of the home as well as the community. A friend recommended Seth at WanderDrone and I am so glad they did! Seth was professional, punctual, and the photos and video he provided were exactly what I needed to showcase this property. The aerial shots were particularly impressive and really helped to highlight the property's unique features. I will definitely be using WanderDrone for future listings!",
          response:
            "Thank you Monica! Your house is beautiful and it was great working with you I'm glad we could help out in any way.",
          responseDate: '3 years ago',
        },
        {
          id: 6,
          reviewer: 'Sojourn Music',
          rating: 5,
          date: '2 years ago',
          text: "Seth's creativity and keen attention to detail results in unbelievable footage. His portfolio speaks for itself!",
          response: null,
          responseDate: null,
        },
        {
          id: 7,
          reviewer: 'R B',
          rating: 5,
          date: '2 years ago',
          text: 'A good friend and an even better videographer. Could not go wrong if you use wander drone, the shots are immaculate!!!',
          response: null,
          responseDate: null,
        },
        {
          id: 8,
          reviewer: 'Jonathan Partridge',
          rating: 5,
          date: '2 years ago',
          text: 'Seth is an Awesome guy, and a amazing drone pilot!',
          response: null,
          responseDate: null,
        },
        {
          id: 9,
          reviewer: 'Julien Verdon',
          rating: 5,
          date: '3 years ago',
          text: 'Such a great experience watching this man do his work.',
          response: null,
          responseDate: null,
        },
        {
          id: 10,
          reviewer: 'Jon Rickett',
          rating: 5,
          date: '2 years ago',
          text: '',
          response: null,
          responseDate: null,
        },
        {
          id: 11,
          reviewer: 'Trey Mitchell',
          rating: 5,
          date: '2 years ago',
          text: '',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 19,
      name: 'Take-Off Drone Services',
      location: 'Midtown Atlanta, GA',
      address: 'Midtown Atlanta, GA',
      phone: '(404) 863-5658',
      website: 'takeoffadrone.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 4,
      status: 'active',
      notes:
        'TakeOff AERIAL DRONE SERVICES Aerial Drone Photography and Videography offers the highest quality, professional drone services for capturing stunning aerial footage and images. Our drones are equipped with state-of-the-art cameras and sensors.',
      services: 'Aerial Drone Photography and Videography',
      yearsInBusiness: 3,
      reviews: [
        {
          id: 1,
          reviewer: 'Brandy Robinson',
          rating: 5,
          date: '2 years ago',
          text: "King'sBridge Retirement Community needed quality aerial pictures and videos. I reached out to several drone services companies, and after speaking with Christhian at Take-Off drone services, I knew he was the right fit for what I was looking for.",
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'David Stiven Salcedo Perez',
          rating: 5,
          date: '1 year ago',
          text: 'I contacted them to take aerial pictures of a few properties and the photos were amazing! High quality 100% recommended',
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'Erick Gaylord',
          rating: 5,
          date: '1 year ago',
          text: 'Great quality, quick turnaround and very professional. Glad I chose this company. I highly recommend.',
          response: null,
          responseDate: null,
        },
        {
          id: 4,
          reviewer: 'Robert Wade',
          rating: 5,
          date: '2 years ago',
          text: '',
          response: null,
          responseDate: null,
        },
      ],
    },
    {
      id: 20,
      name: 'Blue Nose Aerial Imaging',
      location: 'Atlanta, GA',
      address: '4561 River Pkwy, Atlanta, GA 30339',
      phone: '(404) 518-0244',
      website: 'www.bluenoseaerial.com',
      linkedin: '',
      rating: 4.3,
      reviewCount: 6,
      status: 'active',
      notes:
        'Blue Nose Aerial Imaging is a full-scale, nationwide, franchised commercial drone services provider. From Washington to Florida and New York to California, we lead innovation in the Drones-as-a-Service commercial sector. We use the latest technology.',
      services:
        '3d Modeling, Aerial Drone Services, Aerial Imaging, Aerial Imaging Services, Aerial Inspection, Aerial Photography, Aerial Photography And Videography, Aerial Photos And Videos, Aerial Shots, Agriculture Mapping, Commercial Drone Services, Commercial Marketing, Commercial Roof Inspections, Construction Site Inspections, Construction Site Monitoring, Data Analysis, Drone Footage, Drone Imaging, Drone Inspections, Drone Mapping, Drone Photography & Video, Drone Photos & Videos, Drone Services Provider, Drone Surveying, Drone Videography, Fpv Drone, Fpv Drones, Golf Course Management, Health Analysis, Images & Videos, Infrastructure Inspection, Inspection And Surveying, Land Surveying, Locations Services, Marketing Campaigns, Orthomosaic Mapping, Our Drone Photography, Photography And Videography, Precision Agriculture, Real Estate Drone Photography, Rescue Operations, Roof Inspections, Roofing Estimate, Search And Rescue, Site Inspections, Solar Inspections, Special Event, Special Events, Thermal Analyses, Thermal Roof Inspections, Utility Inspections',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Kyle DeAnna',
          rating: 5,
          date: '1 month ago',
          text: 'Excellent drone operator that knows his stuff inside and out! Truly a professional and he takes his work very seriously. I would recommend Blue Nose Aerial to anyone looking for top tier drone photography. Best price and quality in Atlanta by far!',
          response: 'Thank you! Looking forward to working with you again!',
          responseDate: '1 month ago',
        },
        {
          id: 2,
          reviewer: 'Mogahid Hussein',
          rating: 5,
          date: '1 month ago',
          text: "I've known Mark for years, and his expertise in GIS is unmatched. He truly loves what he does, and it shows in the quality of his work. If you need a skilled professional who actually cares about the results, he's the one to go to!",
          response: 'Thank you!',
          responseDate: '1 month ago',
        },
        {
          id: 3,
          reviewer: 'edin chavez',
          rating: 5,
          date: '2 months ago',
          text: 'Great drone operator, him and his team did a job for me, they were super friendly and easy to work with. Videos were impressive. I am very happy and will use them again for sure. I highly recommend.',
          response: 'Thank you. Looking forward to working with you again!',
          responseDate: '2 months ago',
        },
        {
          id: 4,
          reviewer: 'Caitlin Fitch',
          rating: 5,
          date: '1 month ago',
          text: 'Mark is fantastic to work with and always comes through with high quality results. Also has great pricing and is flexible with scheduling.',
          response: 'Thank you. Looking forward to working with you again!',
          responseDate: '1 month ago',
        },
        {
          id: 5,
          reviewer: 'Mr Few',
          rating: 5,
          date: '1 month ago',
          text: "Mark was very attentive to the company's needs. Assignments were on time and communication was great.",
          response: 'Thank you. Looking forward to working with you again!',
          responseDate: '1 month ago',
        },
        {
          id: 6,
          reviewer: 'Lori Valentin',
          rating: 1,
          date: '11 months ago',
          text: '',
          response: 'Have we worked together previously?',
          responseDate: '11 months ago',
        },
      ],
    },
    {
      id: 21,
      name: 'Mermaid Hunter Photography and Drone Services',
      location: 'Atlanta, GA',
      address: 'Atlanta, GA',
      phone: '(770) 344-8899',
      website: 'mermaidhunterdroneservices.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 8,
      status: 'active',
      notes:
        'Looking for high-quality real estate photography, legal photography, stunning drone footage, or professional headshots? Look no further than Mermaid Hunter Photography and Drone Services! Our veteran-owned small business is fully equipped to handle all your photography needs.',
      services:
        'Commercial photography, Events and parties, Headshots and portraits, Real estate photography, Wedding and engagement, Aerial Photography, Construction Photography, Drone Operations, Drone Photography And Video, Images And Videos, Individual Pictures, Photo Session, Photography Portfolio, Real Estate Aerial, Real Estate Photography, Roof Inspections, Construction Photography, Construction Sites, Drone Flight, Drone Inspections, Drone Operations, Drone Photography And Video, Event Planning, General Photography, Ground Photography, Individual Pictures, Landscape Architects, Photo Session, Photography Session, Property Drone Photography, Real Estate Aerial Photography',
      yearsInBusiness: 3,
      reviews: [
        {
          id: 1,
          reviewer: 'Alisha Mcbride',
          rating: 5,
          date: '1 year ago',
          text: 'Russell is an expert in his field ! He took an old drawing I had that I treasured from a while ago and turned it into art work . It had a rip in it . He made my canvas so exceptionally beautiful you can not even tell . I will be back and use him again . The attention to detail is amazing!!!!',
          response:
            'Alisha, thank you for the kind words. It was a wonderful experience working with you and getting your artwork back to life.',
          responseDate: '1 year ago',
        },
        {
          id: 2,
          reviewer: 'Ashley Mitchell',
          rating: 5,
          date: '1 year ago',
          text: 'Russell has helped us document accident and incident scenes using his photography and drone services. He did a FANTASTIC job and is very easy to work with. I highly recommend him if you need scene documentation for litigation purposes!',
          response:
            "Thank you so much for taking the time to share your experience working with Russell! We're thrilled to hear that he provided exceptional photography and drone services for documenting accident and incident scenes.\n\nWe appreciate your recommendation and look forward to assisting you with any future documentation needs.",
          responseDate: '1 year ago',
        },
        {
          id: 3,
          reviewer: 'Queen Majesty',
          rating: 5,
          date: '1 year ago',
          text: 'Russell is passionate about his work and has an eye for detail which is very important in this industry. He did a wonderful photo restoration job for me, and I recommend him without hesitation.',
          response:
            "Thank you for choosing us for your photo restoration needs! We greatly appreciate your kind words and recommendation.\n\nShould you or anyone you know require photography services, please don't hesitate to reach out. We look forward to capturing more memories for you in the future.",
          responseDate: '1 year ago',
        },
        {
          id: 4,
          reviewer: 'Joyce Ray',
          rating: 5,
          date: '1 year ago',
          text: 'My listing of a rural resale home was enhanced by the photos, especially the drone photos that helped buyers get the perspective of the large lot and all amenities. Russell did a great job with providing the shots needed to help buyers visualize the property.',
          response:
            "Thank you for sharing your positive experience with our photography and drone services Joyce! We greatly appreciate your feedback and trust.\n\nIt's fantastic to hear that our photos, particularly the drone shots, played a big role in enhancing the listing of the home.\n\nKnowing that our shots helped buyers visually \"walk through\" the property brings us joy. We're constantly pushing ourselves to create immersive and captivating content that truly transports viewers to the heart of the property.\n\nWe value your continued support and the opportunity to serve you. Should you require our services in the future, please don't hesitate to reach out. We're here to help.",
          responseDate: '1 year ago',
        },
        {
          id: 5,
          reviewer: 'Dana Kind',
          rating: 5,
          date: '1 year ago',
          text: 'I had a roll of film negative from my Father that was 120mm and 65 yrs old that we needed to print out. They were from his time in the Navy. Russell not only scanned the images to a digital format but cleaned up the individual pictures to make them look like they were taken yesterday. He was very patient and understanding of the importance of these photos to our family. I highly recommend his services.',
          response:
            "Thank you, Dana, for your kind words! Preserving cherished memories is our passion, and we're thrilled that we could help you and your family with your father's precious Navy photos. It was a pleasure serving you, and we appreciate your valuable feedback.",
          responseDate: '1 year ago',
        },
        {
          id: 6,
          reviewer: 'Mariette Clardy-Davis',
          rating: 5,
          date: '1 year ago',
          text: 'I had professional headshots taken for the relaunch of key projects this year and Mr. Davis did a wonderful job with a quick turnaround of the finished product.',
          response:
            "Thank you for choosing our photography services for your professional headshots. We're delighted to hear that you were pleased with our work.\n\nWe greatly appreciate your feedback and look forward to serving you again in the future.",
          responseDate: '1 year ago',
        },
        {
          id: 7,
          reviewer: 'C Gibson',
          rating: 5,
          date: '1 year ago',
          text: 'I was pleased with the service received from this business and very impressed with the quality of the product. I highly recommend this company.',
          response:
            "We appreciate you taking the time to write a review. We're so glad you loved your photos!",
          responseDate: '1 year ago',
        },
        {
          id: 8,
          reviewer: 'Desiree Crammer',
          rating: 5,
          date: '1 year ago',
          text: '',
          response: "Thank you, Desiree. I'm glad you enjoyed the photos!",
          responseDate: '1 year ago',
        },
      ],
    },
    {
      id: 22,
      name: 'CB Drones',
      location: 'Athens, GA',
      address: '505 Club Dr, Athens, GA 30607',
      phone: '(770) 255-8696',
      website: '',
      linkedin: '',
      rating: 5.0,
      reviewCount: 6,
      status: 'active',
      notes:
        'CB Drones integrates traditional photography with drone technology. We utilize the best equipment and technology available to ensure the highest quality outcome for your project. We help businesses stand out, work smarter and sell more.',
      services:
        'Aerial Photography, Interior Photography, Promotional Videos, Real Estate Services',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'Katie Harbison',
          rating: 5,
          date: '5 years ago',
          text: 'Working with CB Drones was a very positive and professional experience for my family. Codey and Fonda exceeded our expectations with their high quality photos and videos, displaying an out-of-state property we would have otherwise not been able to see in person.',
          response: 'Thanks so much!',
          responseDate: '5 years ago',
        },
        {
          id: 2,
          reviewer: 'Chelle',
          rating: 5,
          date: '5 years ago',
          text: 'With integrity, professionalism and true insight into photography and how to maximize the subject matter, CB Drones is leading in the field of filming in the Athens, Ga area. The photos are artistic, imaginative, and have incredibly high quality. I highly recommend their services.',
          response: 'Thank you!!',
          responseDate: '5 years ago',
        },
        {
          id: 3,
          reviewer: 'Andy Kate Hawk',
          rating: 5,
          date: '5 years ago',
          text: "CB Drones does amazing work! The pictures that were taken for us at the West Broad Farmer's Market and Garden and the Community Carnival were phenomenal. We can not wait to use these in our upcoming promotional material. Thank you!",
          response:
            "We're so glad to hear that! We had a blast shooting both events. Look forward to working together again in the future!",
          responseDate: '5 years ago',
        },
        {
          id: 4,
          reviewer: 'Kristen Thrasher',
          rating: 5,
          date: '5 years ago',
          text: 'Fonda and Codey were very professional, courteous and flexible and were able to work with me to meet my specific needs. The photos are amazing quality and were delivered on time and as promised. I will definitely be using their services again.',
          response: 'Thank You!',
          responseDate: '5 years ago',
        },
        {
          id: 5,
          reviewer: 'Brooke Foster',
          rating: 5,
          date: '5 years ago',
          text: 'We received such great service! They were fun to work with, imaginative, and patient! The pictures turned out amazing! Thank you CB Drones!',
          response: 'Thanks so much! We had a blast!',
          responseDate: '5 years ago',
        },
        {
          id: 6,
          reviewer: 'Jeffery Johnson',
          rating: 5,
          date: '5 years ago',
          text: 'i love this company great staff and great work fonda is a great staff member i recconmend them to everyone for your needs!!!',
          response: 'Thanks so much!',
          responseDate: '5 years ago',
        },
      ],
    },
    {
      id: 23,
      name: 'ViewPointUAS Drone Services',
      location: 'Georgia',
      address: 'Georgia',
      phone: '(678) 554-9033',
      website: 'viewpointuas.com',
      linkedin: '',
      rating: 5.0,
      reviewCount: 3,
      status: 'active',
      notes:
        'At ViewPointUAS Drone Services, our goal is to provide high-quality, reliable, and safe drone services to clients in a variety of industries focusing on solar inspections. We strive to be a trusted partner to our clients, delivering valuable data.',
      services: 'Drone Services and 3D Modeling',
      yearsInBusiness: 3,
      reviews: [
        {
          id: 1,
          reviewer: 'Snuggles Dawarrior',
          rating: 5,
          date: '1 year ago',
          text: 'Used these guys for aerials of two development properties. Excellent work. Clear imagery and all done with no fuss and no hassel. Quick, responsive, communicative, and efficient. Will be using in the future.',
          response:
            'Thank you for your excellent review of our aerial photography services for your development properties. We are thrilled that you found our work to be clear, hassle-free, and efficient, and we appreciate your kind words. We look forward to serving you again in the future!',
          responseDate: '1 year ago',
        },
        {
          id: 2,
          reviewer: 'Kinney Lee',
          rating: 5,
          date: '1 year ago',
          text: 'These two young men were very knowledgeable in what needed to be done when we explained what we needed. Excellent customer service and the video provided to us was amazing.',
          response: 'Thank you! It was our pleasure to gather the aerial imagery for you!',
          responseDate: '1 year ago',
        },
        {
          id: 3,
          reviewer: 'Nathan Weems',
          rating: 5,
          date: '1 year ago',
          text: 'Great service with fantastic pricing. Had my solar panels and roof inspected to make sure everything was working properly!',
          response:
            "We appreciate your trust in our expertise, and we're always here to assist you with any future needs or concerns you may have. Should you require any further assistance or have any questions, please feel free to reach out to us.",
          responseDate: '1 year ago',
        },
      ],
    },
    {
      id: 24,
      name: 'iFly Drone Services',
      location: 'Atlanta, GA',
      address: 'Atlanta, GA',
      phone: '(478) 220-8699',
      website: '',
      linkedin: '',
      rating: 5.0,
      reviewCount: 4,
      status: 'active',
      notes:
        'iFly Drone Services provides up-to-date real time image/video acquisitions using thermal and standard video cameras. Services offered are Thermal FAA Certified Pilots, Solar Panel Farms, Thermal Imaging, Search & Rescue, Game Recovery & Animal Tracking.',
      services:
        'Corporate photography, Real estate photography, Aerial Photography, Drone Photography, Drone Photos, Project management, 3D Walk Thru, Commercial Property Tours, Industrial Property Tours, Matterport, Multifamily Property Tour, Office Virtual Tour, Virtual Property Tour, Virtual Property Video, Virtual Property Walk Through, 2d Maps, 360° Panoramas, 3d Imaging, 3d Models, Aerial Drone Photography, Aerial Imaging, Aerial Photo And Video, Aerial Photography Videos, Aerial Roofing Inspections, Aerial View, Commercial And Residential, Commercial Drone Pilot, Commercial Uav Pilots, Construction Monitoring, Construction Site, Drone Technology, Emergency Services, Estate Broker, High Definition Videos, Project Management, Real Estate 3d Virtual Tours, Reimagine Your Industry, Remote Inspection, Search And Rescue, Solar Energy Scanning, Solar Panel, Thermal Drone Services, Virtual Walk',
      yearsInBusiness: 5,
      reviews: [
        {
          id: 1,
          reviewer: 'shannon moye',
          rating: 5,
          date: '5 years ago',
          text: "Iflydronography provided fast and friendly service. They have the best guarantee in the drone industry by guaranteeing their results, and if I wasn't satisfied, I didn't have to pay a dime. There we no upfront charges, so how could you go wrong?",
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'Sara Sykes',
          rating: 5,
          date: '4 years ago',
          text: 'Great customer service, quick and reliable! I strongly recommend everyone to use Ifly Drone Service!',
          response: null,
          responseDate: null,
        },
        {
          id: 3,
          reviewer: 'Jodi Daley',
          rating: 5,
          date: '6 years ago',
          text: 'Having aerial photos of our property is a big help in planning our landscaping.',
          response: null,
          responseDate: null,
        },
        {
          id: 4,
          reviewer: 'Pat Lee',
          rating: 5,
          date: '4 years ago',
          text: 'Very professional, good value, and does things quickly',
          response: 'Thank you for your business',
          responseDate: '4 years ago',
        },
      ],
    },
    {
      id: 25,
      name: 'Drone Captain GA - Drone Services, Real Estate Drone Photography, Drone Videography',
      location: 'Riverdale, GA',
      address: 'Riverdale, GA',
      phone: '(770) 284-4056',
      website: '',
      linkedin: '',
      rating: 2.5,
      reviewCount: 2,
      status: 'active',
      notes:
        'Top notch Aerial Photography and Videography services in Riverdale, GA is one phone call away. Reach Drone Captain GA and we will exceed your expectations.',
      services:
        'Aerial Photography, Drone Services, Real Estate Drone Photography, Drone Videography',
      yearsInBusiness: 7,
      reviews: [
        {
          id: 1,
          reviewer: 'Kresha Porter',
          rating: 1,
          date: '5 years ago',
          text: 'I inquired about services after reading the reviews. I still have not received an estimate nor have i been able to get someone on the phone to discuss. On to looking for a reputable company that would appreciate my business.',
          response: null,
          responseDate: null,
        },
        {
          id: 2,
          reviewer: 'Pascal Eze',
          rating: 4,
          date: '7 years ago',
          text: 'Good service',
          response: null,
          responseDate: null,
        },
      ],
    },
  ]);

  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    location: '',
    address: '',
    phone: '',
    website: '',
    linkedin: '',
    rating: 0,
    reviewCount: 0,
    status: 'active',
    notes: '',
  });

  const [editingCompetitor, setEditingCompetitor] = useState(null);
  const [competitorToDelete, setCompetitorToDelete] = useState(null);

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const cancelRef = React.useRef();

  const [selectedCompetitor, setSelectedCompetitor] = useState(null);

  const [stats, setStats] = useState([
    {
      label: 'Total Competitors',
      value: competitors.length,
      change: '+10%',
      icon: FaStar,
    },
    {
      label: 'Active Competitors',
      value: competitors.filter(c => c.status === 'active').length,
      change: '+15%',
      icon: FaThumbsUp,
    },
    {
      label: 'Inactive Competitors',
      value: competitors.filter(c => c.status === 'inactive').length,
      change: '-5%',
      icon: FaThumbsDown,
    },
    {
      label: 'Average Rating',
      value: competitors.reduce((total, c) => total + c.rating, 0) / competitors.length,
      change: '+0.2',
      icon: FaStar,
    },
  ]);

  const [searchResults, setSearchResults] = useState(competitors);
  const [filteredCompetitors, setFilteredCompetitors] = useState(competitors);

  // Define color variables
  const bgColor = 'bg-white';
  const borderColor = 'border-gray-200';

  // New state for analytics
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('rating');
  const [analyticsView, setAnalyticsView] = useState('overview');

  // Analytics functions
  const calculateReviewMetrics = reviews => {
    const total = reviews.length;
    const positive = reviews.filter(r => r.rating >= 4).length;
    const negative = reviews.filter(r => r.rating <= 2).length;
    const neutral = reviews.filter(r => r.rating === 3).length;

    return {
      total,
      positive,
      negative,
      neutral,
      positivePercentage: (positive / total) * 100,
      negativePercentage: (negative / total) * 100,
      neutralPercentage: (neutral / total) * 100,
    };
  };

  const analyzeSentiment = text => {
    // Handle non-string input
    if (!text || typeof text !== 'string') {
      return {
        score: 0,
        positive: 0,
        negative: 0,
      };
    }

    // Simple keyword-based sentiment analysis
    const positiveWords = [
      'great',
      'excellent',
      'amazing',
      'helpful',
      'professional',
      'perfect',
      'love',
      'best',
      'fantastic',
      'awesome',
    ];
    const negativeWords = [
      'bad',
      'poor',
      'terrible',
      'issue',
      'problem',
      'delay',
      'difficult',
      'disappointed',
      'waste',
      'awful',
    ];

    const words = text.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;

    return {
      score: (positiveCount - negativeCount) / (positiveCount + negativeCount + 1),
      positive: positiveCount,
      negative: negativeCount,
    };
  };

  const classifyReviewTopics = review => {
    const topics = {
      'Service Quality': {
        keywords: [
          'service',
          'professional',
          'helpful',
          'responsive',
          'customer service',
          'support',
          'staff',
          'team',
        ],
        confidence: 0,
      },
      'Drone Performance': {
        keywords: [
          'drone',
          'camera',
          'quality',
          'footage',
          'video',
          'photo',
          'stable',
          'resolution',
          'equipment',
        ],
        confidence: 0,
      },
      Pricing: {
        keywords: [
          'price',
          'cost',
          'expensive',
          'affordable',
          'value',
          'worth',
          'package',
          'deal',
          'rate',
        ],
        confidence: 0,
      },
      Communication: {
        keywords: [
          'communication',
          'responsive',
          'reply',
          'contact',
          'email',
          'phone',
          'message',
          'update',
        ],
        confidence: 0,
      },
      Timeliness: {
        keywords: [
          'time',
          'schedule',
          'quick',
          'fast',
          'prompt',
          'delay',
          'wait',
          'deadline',
          'turnaround',
        ],
        confidence: 0,
      },
      'Technical Issues': {
        keywords: [
          'issue',
          'problem',
          'error',
          'malfunction',
          'technical',
          'fix',
          'broken',
          'crash',
          'failure',
        ],
        confidence: 0,
      },
      'Customer Support': {
        keywords: [
          'support',
          'help',
          'assistance',
          'guide',
          'answer',
          'question',
          'resolve',
          'solution',
        ],
        confidence: 0,
      },
    };

    const text = review.text.toLowerCase();
    const words = text.split(/\W+/);

    // Calculate confidence for each topic
    Object.entries(topics).forEach(([topic, data]) => {
      const matchedKeywords = data.keywords.filter(
        keyword => text.includes(keyword) || words.some(word => keyword.includes(word))
      );
      data.confidence = matchedKeywords.length / data.keywords.length;
    });

    // Assign topics with confidence above threshold
    const threshold = 0.2;
    const assignedTopics = Object.entries(topics)
      .filter(([_, data]) => data.confidence > threshold)
      .map(([topic, data]) => ({
        topic,
        confidence: data.confidence,
      }));

    return assignedTopics;
  };

  const getTrendData = competitor => {
    // Sort reviews by date
    const sortedReviews = [...competitor.reviews].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Group reviews by month
    const monthlyData = sortedReviews.reduce((acc, review) => {
      const month = new Date(review.date).toLocaleString('default', { month: 'short' });
      if (!acc[month]) {
        acc[month] = {
          count: 0,
          totalRating: 0,
          reviews: [],
        };
      }
      acc[month].count++;
      acc[month].totalRating += review.rating;
      acc[month].reviews.push(review);
      return acc;
    }, {});

    return monthlyData;
  };

  // Render analytics components
  const renderAnalyticsOverview = () => {
    // Calculate overall sentiment for all reviews
    const overallSentiment = competitors.reduce(
      (acc, competitor) => {
        const reviews = competitor.reviews || [];
        reviews.forEach(review => {
          if (review && review.text) {
            const sentiment = analyzeSentiment(review.text);
            if (sentiment.score > 0.2) acc.positive++;
            else if (sentiment.score < -0.2) acc.negative++;
            else acc.neutral++;
          }
        });
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );

    // Calculate total reviews
    const totalReviews = competitors.reduce((sum, comp) => sum + (comp.reviewCount || 0), 0);

    // Calculate average rating
    const totalRating = competitors.reduce((sum, comp) => sum + (comp.rating || 0), 0);
    const averageRating = totalRating / (competitors.length || 1);

    // Count active competitors
    const activeCompetitors = competitors.filter(comp => comp.status === 'active').length;

    const stats = [
      {
        label: 'Total Competitors',
        value: competitors.length,
        change: '+2 this month',
        icon: FaBuilding,
      },
      {
        label: 'Average Rating',
        value: averageRating.toFixed(1),
        change: '+0.2 vs last month',
        icon: FaStar,
      },
      {
        label: 'Total Reviews',
        value: totalReviews,
        change: '+15 this month',
        icon: FaComments,
      },
      {
        label: 'Active Competitors',
        value: activeCompetitors,
        change: 'No change',
        icon: FaUserFriends,
      },
    ];

    return (
      <VStack spacing={6} align="stretch">
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

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <Heading size="md">Review Sentiment Distribution</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Text width="100px">Positive</Text>
                <Progress
                  value={(overallSentiment.positive / totalReviews) * 100}
                  colorScheme="green"
                  width="100%"
                />
                <Text width="40px">
                  {Math.round((overallSentiment.positive / totalReviews) * 100)}%
                </Text>
              </HStack>
              <HStack>
                <Text width="100px">Neutral</Text>
                <Progress
                  value={(overallSentiment.neutral / totalReviews) * 100}
                  colorScheme="yellow"
                  width="100%"
                />
                <Text width="40px">
                  {Math.round((overallSentiment.neutral / totalReviews) * 100)}%
                </Text>
              </HStack>
              <HStack>
                <Text width="100px">Negative</Text>
                <Progress
                  value={(overallSentiment.negative / totalReviews) * 100}
                  colorScheme="red"
                  width="100%"
                />
                <Text width="40px">
                  {Math.round((overallSentiment.negative / totalReviews) * 100)}%
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  };

  const renderCompetitorComparison = () => {
    return (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Rating Comparison</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {competitors.map(competitor => (
                <HStack key={competitor.id} width="100%">
                  <Text width="200px">{competitor.name}</Text>
                  <Progress value={competitor.rating * 20} colorScheme="blue" width="100%" />
                  <Text width="60px">{competitor.rating}</Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Review Volume</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {competitors.map(competitor => (
                <HStack key={competitor.id} width="100%">
                  <Text width="200px">{competitor.name}</Text>
                  <Progress
                    value={
                      (competitor.reviewCount / Math.max(...competitors.map(c => c.reviewCount))) *
                      100
                    }
                    colorScheme="green"
                    width="100%"
                  />
                  <Text width="60px">{competitor.reviewCount}</Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    );
  };

  const StarIcon = React.forwardRef((props, ref) => <Icon ref={ref} as={FaStar} {...props} />);
  StarIcon.displayName = 'StarIcon';

  const renderStars = rating => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon key={`star-${rating}-${i}`} color={i < rating ? 'yellow.400' : 'gray.300'} />
      );
    }
    return stars;
  };

  const handleAddCompetitor = () => {
    // Add new competitor logic
    console.log('Add new competitor:', newCompetitor);
    onAddClose();
  };

  const handleEditCompetitor = () => {
    // Edit existing competitor logic
    console.log('Edit competitor:', editingCompetitor);
    onEditClose();
  };

  const handleDeleteCompetitor = () => {
    // Delete competitor logic
    console.log('Delete competitor:', competitorToDelete);
    onDeleteClose();
  };

  const openViewModal = competitor => {
    setSelectedCompetitor(competitor);
    onViewOpen();
  };

  const openEditModal = competitor => {
    setEditingCompetitor(competitor);
    onEditOpen();
  };

  const openDeleteModal = competitor => {
    setCompetitorToDelete(competitor);
    onDeleteOpen();
  };

  // New state for Analysis tab
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [selectedCompetitorForAnalysis, setSelectedCompetitorForAnalysis] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const toast = useToast();

  // Analysis functions
  const startAnalysis = competitor => {
    setSelectedCompetitorForAnalysis(competitor);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep('Initializing analysis...');

    // Simulate the analysis process
    simulateAnalysisProcess();
  };

  const simulateAnalysisProcess = () => {
    // This is a simulation of the analysis process
    // In a real implementation, this would call an API or service

    const steps = [
      { progress: 10, step: 'Preprocessing reviews...' },
      { progress: 20, step: 'Extracting intents...' },
      { progress: 30, step: 'Computing embeddings...' },
      { progress: 40, step: 'Applying topic modeling...' },
      { progress: 50, step: 'Generating topic labels...' },
      { progress: 60, step: 'Analyzing sentiment...' },
      { progress: 70, step: 'Identifying key themes...' },
      { progress: 80, step: 'Generating insights...' },
      { progress: 90, step: 'Finalizing results...' },
      { progress: 100, step: 'Analysis complete!' },
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setAnalysisProgress(steps[currentStep].progress);
        setAnalysisStep(steps[currentStep].step);
        currentStep++;
      } else {
        clearInterval(interval);
        completeAnalysis();
      }
    }, 800);
  };

  const completeAnalysis = () => {
    // Generate mock analysis results
    const mockResults = generateMockAnalysisResults(selectedCompetitorForAnalysis);
    setAnalysisResults(mockResults);
    setIsAnalyzing(false);

    toast({
      title: 'Analysis Complete',
      description: `Analysis for ${selectedCompetitorForAnalysis.name} is complete.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const generateMockAnalysisResults = competitor => {
    // Process all reviews to classify topics and analyze sentiment
    const processedReviews = competitor.reviews.map(review => ({
      ...review,
      topics: classifyReviewTopics(review),
      sentiment: analyzeSentiment(review.text),
    }));

    // Aggregate topics and their reviews
    const topicData = {};
    processedReviews.forEach(review => {
      review.topics.forEach(({ topic, confidence }) => {
        if (!topicData[topic]) {
          // Get keywords from the topics defined in classifyReviewTopics
          const topicsFromClassifier = {
            'Service Quality': {
              keywords: [
                'service',
                'professional',
                'helpful',
                'responsive',
                'customer service',
                'support',
                'staff',
                'team',
              ],
            },
            'Drone Performance': {
              keywords: [
                'drone',
                'camera',
                'quality',
                'footage',
                'video',
                'photo',
                'stable',
                'resolution',
                'equipment',
              ],
            },
            Pricing: {
              keywords: [
                'price',
                'cost',
                'expensive',
                'affordable',
                'value',
                'worth',
                'package',
                'deal',
                'rate',
              ],
            },
            Communication: {
              keywords: [
                'communication',
                'responsive',
                'reply',
                'contact',
                'email',
                'phone',
                'message',
                'update',
              ],
            },
            Timeliness: {
              keywords: [
                'time',
                'schedule',
                'quick',
                'fast',
                'prompt',
                'delay',
                'wait',
                'deadline',
                'turnaround',
              ],
            },
            'Technical Issues': {
              keywords: [
                'issue',
                'problem',
                'error',
                'malfunction',
                'technical',
                'fix',
                'broken',
                'crash',
                'failure',
              ],
            },
            'Customer Support': {
              keywords: [
                'support',
                'help',
                'assistance',
                'guide',
                'answer',
                'question',
                'resolve',
                'solution',
              ],
            },
          };
          topicData[topic] = {
            count: 0,
            reviews: [],
            totalSentiment: 0,
            keywords: topicsFromClassifier[topic].keywords,
          };
        }
        topicData[topic].count++;
        topicData[topic].reviews.push({ ...review, topicConfidence: confidence });
        topicData[topic].totalSentiment += review.sentiment.score;
      });
    });

    // Convert to final format and calculate sentiment
    const topics = Object.entries(topicData).map(([name, data]) => {
      const avgSentiment = data.totalSentiment / data.count;
      return {
        id: name.toLowerCase().replace(/\s+/g, '_'),
        name,
        count: data.count,
        sentiment: avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral',
        keywords: data.keywords,
        examples: data.reviews
          .sort((a, b) => b.topicConfidence - a.topicConfidence)
          .slice(0, 3)
          .map(review => ({
            text: review.text,
            rating: review.rating,
            date: review.date,
            confidence: review.topicConfidence,
            sentiment: review.sentiment,
          })),
      };
    });

    // Calculate overall sentiment distribution
    const sentimentCounts = processedReviews.reduce(
      (acc, review) => {
        const sentiment =
          review.sentiment.score > 0.2
            ? 'positive'
            : review.sentiment.score < -0.2
              ? 'negative'
              : 'neutral';
        acc[sentiment]++;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );

    const total = Object.values(sentimentCounts).reduce((a, b) => a + b, 0);
    const sentimentDistribution = {
      positive: Math.round((sentimentCounts.positive / total) * 100),
      neutral: Math.round((sentimentCounts.neutral / total) * 100),
      negative: Math.round((sentimentCounts.negative / total) * 100),
    };

    // Generate insights based on the actual data
    const keyInsights = [
      `${Math.round(sentimentDistribution.positive)}% of reviews express positive sentiment`,
      `Most discussed topics: ${topics
        .slice(0, 3)
        .map(t => t.name)
        .join(', ')}`,
      topics.find(t => t.sentiment === 'negative')
        ? `Areas needing attention: ${topics
            .filter(t => t.sentiment === 'negative')
            .map(t => t.name)
            .join(', ')}`
        : `No significant negative topics identified`,
      `Top performing area: ${topics.sort((a, b) => b.count - a.count)[0].name}`,
    ];

    return {
      topics: topics.sort((a, b) => b.count - a.count),
      topicExamples: topics.sort((a, b) => b.count - a.count),
      sentimentDistribution,
      keyInsights,
      competitorName: competitor.name,
      totalReviews: competitor.reviewCount,
      averageRating: competitor.rating,
    };
  };

  // Render Analysis tab
  const renderAnalysisTab = () => {
    return (
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <Heading size="md">LLM-Enhanced Review Analysis</Heading>
          </CardHeader>
          <CardBody>
            <Text mb={4}>
              This analysis uses advanced Natural Language Processing and Large Language Models to
              extract meaningful insights from competitor reviews. Select a competitor to analyze
              their reviews and discover key topics, sentiment trends, and actionable insights.
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <FormLabel>Select Competitor</FormLabel>
                <Select
                  placeholder="Choose a competitor"
                  value={selectedCompetitorForAnalysis?.id || ''}
                  onChange={e => {
                    const competitor = competitors.find(c => c.id === parseInt(e.target.value));
                    setSelectedCompetitorForAnalysis(competitor);
                  }}
                >
                  {competitors.map(competitor => (
                    <option key={`competitor-${competitor.id}`} value={competitor.id}>
                      {competitor.name} ({competitor.reviewCount} reviews)
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <FormLabel>&nbsp;</FormLabel>
                <Button
                  colorScheme="blue"
                  width="100%"
                  onClick={() => startAnalysis(selectedCompetitorForAnalysis)}
                  isDisabled={!selectedCompetitorForAnalysis || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <HStack>
                      <FaSpinner className="fa-spin" />
                      <Text>Analyzing...</Text>
                    </HStack>
                  ) : (
                    <HStack>
                      <FaBrain />
                      <Text>Analyze Reviews</Text>
                    </HStack>
                  )}
                </Button>
              </Box>
            </SimpleGrid>

            {isAnalyzing && (
              <Box mt={6}>
                <Text mb={2}>{analysisStep}</Text>
                <Progress value={analysisProgress} colorScheme="blue" size="sm" />
              </Box>
            )}
          </CardBody>
        </Card>

        {analysisResults && !isAnalyzing && (
          <>
            <Card>
              <CardHeader>
                <Heading size="md">Analysis Results: {analysisResults.competitorName}</Heading>
                <Text fontSize="sm" color="gray.500">
                  Based on {analysisResults.totalReviews} reviews with an average rating of{' '}
                  {analysisResults.averageRating}
                </Text>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Box>
                    <Heading size="sm" mb={3}>
                      Sentiment Distribution
                    </Heading>
                    <VStack align="stretch" spacing={2}>
                      <HStack>
                        <Text width="100px">Positive</Text>
                        <Progress
                          value={analysisResults.sentimentDistribution.positive}
                          colorScheme="green"
                          width="100%"
                        />
                        <Text width="40px">{analysisResults.sentimentDistribution.positive}%</Text>
                      </HStack>
                      <HStack>
                        <Text width="100px">Neutral</Text>
                        <Progress
                          value={analysisResults.sentimentDistribution.neutral}
                          colorScheme="yellow"
                          width="100%"
                        />
                        <Text width="40px">{analysisResults.sentimentDistribution.neutral}%</Text>
                      </HStack>
                      <HStack>
                        <Text width="100px">Negative</Text>
                        <Progress
                          value={analysisResults.sentimentDistribution.negative}
                          colorScheme="red"
                          width="100%"
                        />
                        <Text width="40px">{analysisResults.sentimentDistribution.negative}%</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={3}>
                      Key Insights
                    </Heading>
                    <List spacing={2}>
                      {analysisResults.keyInsights.map((insight, index) => (
                        <ListItem key={index}>
                          <ListIcon as={FaLightbulb} color="yellow.500" />
                          {insight}
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={3}>
                      Topic Distribution
                    </Heading>
                    <VStack align="stretch" spacing={2}>
                      {analysisResults.topics.slice(0, 5).map(topic => (
                        <HStack key={topic.id}>
                          <Text width="120px" noOfLines={1}>
                            {topic.name}
                          </Text>
                          <Progress
                            value={(topic.count / analysisResults.totalReviews) * 100}
                            colorScheme={
                              topic.sentiment === 'positive'
                                ? 'green'
                                : topic.sentiment === 'negative'
                                  ? 'red'
                                  : 'yellow'
                            }
                            width="100%"
                          />
                          <Text width="40px">{topic.count}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Topic Analysis</Heading>
                <Text fontSize="sm" color="gray.500">
                  Discovered topics from customer reviews with sentiment and example reviews
                </Text>
              </CardHeader>
              <CardBody>
                <Accordion allowMultiple>
                  {analysisResults.topicExamples.map(topic => (
                    <AccordionItem key={topic.id}>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Badge
                              colorScheme={
                                topic.sentiment === 'positive'
                                  ? 'green'
                                  : topic.sentiment === 'negative'
                                    ? 'red'
                                    : 'yellow'
                              }
                            >
                              {topic.name}
                            </Badge>
                            <Text fontSize="sm" color="gray.500">
                              {topic.count} reviews
                            </Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <VStack align="stretch" spacing={4}>
                          <Box>
                            <Text fontWeight="bold" mb={2}>
                              Keywords:
                            </Text>
                            <Wrap>
                              {topic.keywords.map((keyword, index) => (
                                <WrapItem key={index}>
                                  <Tag size="md" colorScheme="blue" variant="subtle">
                                    <TagLabel>{keyword}</TagLabel>
                                  </Tag>
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>

                          <Box>
                            <Text fontWeight="bold" mb={2}>
                              Example Reviews:
                            </Text>
                            <VStack align="stretch" spacing={3}>
                              {topic.examples.map((example, index) => (
                                <Box
                                  key={index}
                                  p={3}
                                  bg="gray.50"
                                  borderRadius="md"
                                  borderLeft="4px solid"
                                  borderLeftColor={
                                    topic.sentiment === 'positive'
                                      ? 'green.500'
                                      : topic.sentiment === 'negative'
                                        ? 'red.500'
                                        : 'yellow.500'
                                  }
                                >
                                  <HStack mb={2} justify="space-between">
                                    <HStack>
                                      {renderStars(example.rating)}
                                      <Text fontSize="sm" color="gray.500">
                                        {example.date}
                                      </Text>
                                    </HStack>
                                    <Tooltip label="Topic relevance score">
                                      <Tag size="sm" colorScheme="blue">
                                        {Math.round(example.confidence * 100)}% match
                                      </Tag>
                                    </Tooltip>
                                  </HStack>
                                  <Text>{example.text}</Text>
                                  <HStack mt={2} spacing={2}>
                                    <Tag
                                      size="sm"
                                      colorScheme={
                                        example.sentiment.score > 0
                                          ? 'green'
                                          : example.sentiment.score < 0
                                            ? 'red'
                                            : 'yellow'
                                      }
                                    >
                                      <TagLabel>
                                        {example.sentiment.score > 0
                                          ? 'Positive'
                                          : example.sentiment.score < 0
                                            ? 'Negative'
                                            : 'Neutral'}
                                      </TagLabel>
                                    </Tag>
                                    <Text fontSize="sm" color="gray.500">
                                      {example.sentiment.positive} positive /{' '}
                                      {example.sentiment.negative} negative words
                                    </Text>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Actionable Recommendations</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Heading size="sm" mb={3}>
                      Strengths to Leverage
                    </Heading>
                    <List spacing={2}>
                      {analysisResults.topics
                        .filter(topic => topic.sentiment === 'positive')
                        .slice(0, 3)
                        .map(topic => (
                          <ListItem key={topic.id}>
                            <ListIcon as={FaThumbsUp} color="green.500" />
                            <Text fontWeight="bold">{topic.name}</Text>
                            <Text fontSize="sm">
                              Highlight this aspect in marketing materials and maintain high
                              standards
                            </Text>
                          </ListItem>
                        ))}
                    </List>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={3}>
                      Areas for Improvement
                    </Heading>
                    <List spacing={2}>
                      {analysisResults.topics
                        .filter(
                          topic => topic.sentiment === 'negative' || topic.sentiment === 'neutral'
                        )
                        .slice(0, 3)
                        .map(topic => (
                          <ListItem key={topic.id}>
                            <ListIcon as={FaExclamationTriangle} color="orange.500" />
                            <Text fontWeight="bold">{topic.name}</Text>
                            <Text fontSize="sm">
                              Develop strategies to address customer concerns in this area
                            </Text>
                          </ListItem>
                        ))}
                    </List>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    );
  };

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Competitor Dashboard</Heading>

        {/* Analytics Tabs */}
        <Tabs
          onChange={index =>
            setAnalyticsView(['overview', 'comparison', 'details', 'analysis'][index])
          }
        >
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Competitor Comparison</Tab>
            <Tab>Competitor Details</Tab>
            <Tab>Analysis</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>{renderAnalyticsOverview()}</TabPanel>
            <TabPanel>{renderCompetitorComparison()}</TabPanel>
            <TabPanel>
              {/* Stats Grid */}
              <Grid
                templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
                gap={6}
              >
                {stats.map((stat, index) => (
                  <GridItem key={index}>
                    <Box
                      p={5}
                      bg={bgColor}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
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
                  placeholder="Search competitors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  maxW="300px"
                />
                <Select
                  value={filterRating}
                  onChange={e => setFilterRating(e.target.value)}
                  maxW="150px"
                >
                  <option value="all">All Ratings</option>
                  <option value="high">High (4.5+)</option>
                  <option value="medium">Medium (3.5-4.4)</option>
                  <option value="low">Low (&lt;3.5)</option>
                </Select>
                <Button colorScheme="blue" onClick={onAddOpen}>
                  Add Competitor
                </Button>
              </HStack>

              {/* Competitors Table */}
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Company Name</Th>
                      <Th>Location</Th>
                      <Th>Rating</Th>
                      <Th>Reviews</Th>
                      <Th>Website</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCompetitors.map(competitor => (
                      <Tr key={competitor.id}>
                        <Td>{competitor.name}</Td>
                        <Td>{competitor.location}</Td>
                        <Td>
                          <HStack>
                            {renderStars(competitor.rating)}
                            <Text ml={2}>{competitor.rating}</Text>
                          </HStack>
                        </Td>
                        <Td>{competitor.reviewCount}</Td>
                        <Td>
                          {competitor.website ? (
                            <Link
                              href={`https://${competitor.website}`}
                              isExternal
                              color="blue.500"
                            >
                              {competitor.website}
                            </Link>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge colorScheme={competitor.status === 'active' ? 'green' : 'gray'}>
                            {competitor.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => openViewModal(competitor)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="teal"
                              onClick={() => openEditModal(competitor)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => openDeleteModal(competitor)}
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
            </TabPanel>
            <TabPanel>{renderAnalysisTab()}</TabPanel>
          </TabPanels>
        </Tabs>

        {/* Add Competitor Modal */}
        <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Competitor</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    placeholder="Company name"
                    value={newCompetitor.name}
                    onChange={e => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input
                    placeholder="City, State"
                    value={newCompetitor.location}
                    onChange={e => setNewCompetitor({ ...newCompetitor, location: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Address</FormLabel>
                  <Textarea
                    placeholder="Full address"
                    value={newCompetitor.address}
                    onChange={e => setNewCompetitor({ ...newCompetitor, address: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    placeholder="(123) 456-7890"
                    value={newCompetitor.phone}
                    onChange={e => setNewCompetitor({ ...newCompetitor, phone: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Website</FormLabel>
                  <Input
                    placeholder="example.com"
                    value={newCompetitor.website}
                    onChange={e => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>LinkedIn</FormLabel>
                  <Input
                    placeholder="https://linkedin.com/company/example"
                    value={newCompetitor.linkedin}
                    onChange={e => setNewCompetitor({ ...newCompetitor, linkedin: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Google Rating</FormLabel>
                  <NumberInput
                    min={0}
                    max={5}
                    step={0.1}
                    value={newCompetitor.rating}
                    onChange={value =>
                      setNewCompetitor({ ...newCompetitor, rating: parseFloat(value) || 0 })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Review Count</FormLabel>
                  <NumberInput
                    min={0}
                    value={newCompetitor.reviewCount}
                    onChange={value =>
                      setNewCompetitor({ ...newCompetitor, reviewCount: parseInt(value) || 0 })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={newCompetitor.status}
                    onChange={e => setNewCompetitor({ ...newCompetitor, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    placeholder="Additional notes about this competitor"
                    value={newCompetitor.notes}
                    onChange={e => setNewCompetitor({ ...newCompetitor, notes: e.target.value })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleAddCompetitor}>
                Add
              </Button>
              <Button variant="ghost" onClick={onAddClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Competitor Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Competitor</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {editingCompetitor && (
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      placeholder="Company name"
                      value={editingCompetitor.name}
                      onChange={e =>
                        setEditingCompetitor({ ...editingCompetitor, name: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input
                      placeholder="City, State"
                      value={editingCompetitor.location}
                      onChange={e =>
                        setEditingCompetitor({ ...editingCompetitor, location: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Textarea
                      placeholder="Full address"
                      value={editingCompetitor.address}
                      onChange={e =>
                        setEditingCompetitor({ ...editingCompetitor, address: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      placeholder="(123) 456-7890"
                      value={editingCompetitor.phone}
                      onChange={e =>
                        setEditingCompetitor({ ...editingCompetitor, phone: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Website</FormLabel>
                    <Input
                      placeholder="example.com"
                      value={editingCompetitor.website}
                      onChange={e =>
                        setEditingCompetitor({ ...editingCompetitor, website: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>LinkedIn</FormLabel>
                    <Input
                      placeholder="https://linkedin.com/company/example"
                      value={editingCompetitor.linkedin}
                      onChange={e =>
                        setEditingCompetitor({ ...editingCompetitor, linkedin: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Google Rating</FormLabel>
                    <NumberInput
                      min={0}
                      max={5}
                      step={0.1}
                      value={editingCompetitor.rating}
                      onChange={value =>
                        setEditingCompetitor({
                          ...editingCompetitor,
                          rating: parseFloat(value) || 0,
                        })
                      }
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Review Count</FormLabel>
                    <NumberInput
                      min={0}
                      value={editingCompetitor.reviewCount}
                      onChange={value =>
                        setEditingCompetitor({
                          ...editingCompetitor,
                          reviewCount: parseInt(value) || 0,
                        })
                      }
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={editingCompetitor.status}
                      onChange={e =>
                        setEditingCompetitor({ ...editingCompetitor, status: e.target.value })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Notes</FormLabel>
                    <Textarea
                      placeholder="Additional notes about this competitor"
                      value={editingCompetitor.notes}
                      onChange={e =>
                        setEditingCompetitor({ ...editingCompetitor, notes: e.target.value })
                      }
                    />
                  </FormControl>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleEditCompetitor}>
                Save
              </Button>
              <Button variant="ghost" onClick={onEditClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Competitor Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedCompetitor?.name}
              <Badge
                ml={2}
                colorScheme={selectedCompetitor?.status === 'active' ? 'green' : 'gray'}
              >
                {selectedCompetitor?.status}
              </Badge>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedCompetitor && (
                <VStack spacing={6} align="stretch">
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                    <GridItem>
                      <Box
                        p={4}
                        bg={bgColor}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor={borderColor}
                      >
                        <VStack align="stretch" spacing={3}>
                          <HStack>
                            <Icon as={FaMapMarkerAlt} />
                            <Text fontWeight="bold">Location:</Text>
                            <Text>{selectedCompetitor.location}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FaBuilding} />
                            <Text fontWeight="bold">Address:</Text>
                            <Text>{selectedCompetitor.address}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FaPhone} />
                            <Text fontWeight="bold">Phone:</Text>
                            <Text>{selectedCompetitor.phone}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FaGlobe} />
                            <Text fontWeight="bold">Website:</Text>
                            {selectedCompetitor.website ? (
                              <Link
                                href={`https://${selectedCompetitor.website}`}
                                isExternal
                                color="blue.500"
                              >
                                {selectedCompetitor.website}
                              </Link>
                            ) : (
                              <Text color="gray.400">-</Text>
                            )}
                          </HStack>
                          <HStack>
                            <Icon as={FaLinkedin} />
                            <Text fontWeight="bold">LinkedIn:</Text>
                            {selectedCompetitor.linkedin ? (
                              <Link href={selectedCompetitor.linkedin} isExternal color="blue.500">
                                View Profile
                              </Link>
                            ) : (
                              <Text color="gray.400">-</Text>
                            )}
                          </HStack>
                        </VStack>
                      </Box>
                    </GridItem>
                    <GridItem>
                      <Box
                        p={4}
                        bg={bgColor}
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor={borderColor}
                      >
                        <VStack align="stretch" spacing={3}>
                          <HStack>
                            <Icon as={FaStar} color="yellow.400" />
                            <Text fontWeight="bold">Google Rating:</Text>
                            <HStack>
                              {renderStars(selectedCompetitor.rating)}
                              <Text ml={2}>({selectedCompetitor.rating})</Text>
                            </HStack>
                          </HStack>
                          <HStack>
                            <Icon as={FaGoogle} />
                            <Text fontWeight="bold">Review Count:</Text>
                            <Text>{selectedCompetitor.reviewCount}</Text>
                          </HStack>
                          <HStack>
                            <Icon as={FaThumbsUp} />
                            <Text fontWeight="bold">Status:</Text>
                            <Badge
                              colorScheme={
                                selectedCompetitor.status === 'active' ? 'green' : 'gray'
                              }
                            >
                              {selectedCompetitor.status}
                            </Badge>
                          </HStack>
                        </VStack>
                      </Box>
                    </GridItem>
                  </Grid>

                  <Box>
                    <Heading size="md" mb={2}>
                      Notes
                    </Heading>
                    <Text>{selectedCompetitor.notes || 'No notes available.'}</Text>
                  </Box>

                  <Box>
                    <Heading size="md" mb={2}>
                      Google Reviews
                    </Heading>
                    <Accordion allowMultiple>
                      {selectedCompetitor.reviews.length > 0 ? (
                        selectedCompetitor.reviews.map(review => (
                          <AccordionItem key={`${selectedCompetitor.id}-review-${review.id}`}>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack>
                                  <Avatar size="sm" name={review.reviewer} />
                                  <Text fontWeight="bold">{review.reviewer}</Text>
                                  <Spacer />
                                  <HStack>{renderStars(review.rating)}</HStack>
                                </HStack>
                                <Text fontSize="sm" color="gray.500">
                                  {review.date}
                                </Text>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              <Text mb={2}>{review.text}</Text>
                              {review.response && (
                                <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                                  <HStack mb={1}>
                                    <Icon as={FaReply} color="blue.500" />
                                    <Text fontWeight="bold">
                                      Response from {selectedCompetitor.name}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.500" mb={2}>
                                    {review.responseDate}
                                  </Text>
                                  <Text>{review.response}</Text>
                                </Box>
                              )}
                            </AccordionPanel>
                          </AccordionItem>
                        ))
                      ) : (
                        <Text>No reviews available.</Text>
                      )}
                    </Accordion>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={() => {
                  onViewClose();
                  openEditModal(selectedCompetitor);
                }}
              >
                Edit
              </Button>
              <Button variant="ghost" onClick={onViewClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Competitor</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete {competitorToDelete?.name}? This action cannot be
                undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteCompetitor} ml={3}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default CompetitorDashboard;
