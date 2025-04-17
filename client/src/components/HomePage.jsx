// // Install these dependencies first:
// // npm install @react-spring/web framer-motion react-icons react-3d-carousel

// import { useState, useEffect ,useRef} from 'react';
// import { motion, useInView } from 'framer-motion';
// // import Carousel from "react-spring-3d-carousel";

// import styled from 'styled-components';

// // OwnerContainer Component
// const OwnersContainer = () => {
//   const [owners, setOwners] = useState([
//     { id: 1, name: 'John Doe', contact: '+1 234 567 890', email: 'john@justrentit.com' },
//     { id: 2, name: 'Jane Smith', contact: '+1 987 654 321', email: 'jane@justrentit.com' },
//     { id: 3, name: 'Mike Johnson', contact: '+1 456 789 012', email: 'mike@justrentit.com' },
//     { id: 4, name: 'Sarah Wilson', contact: '+1 321 654 987', email: 'sarah@justrentit.com' },
//     { id: 5, name: 'David Brown', contact: '+1 789 012 345', email: 'david@justrentit.com' },
//   ]);

//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true });

//   return (
//     <OwnersSection ref={ref}>
//       <motion.h2
//         initial={{ opacity: 0, y: 20 }}
//         animate={isInView ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         Top Owners
//       </motion.h2>
      
//       {/* <CarouselContainer>
//         <Carousel
//           slides={owners.map((owner, index) => ({
//             key: index,
//             content: <OwnerCard owner={owner} />
//           }))}
//           autoplay={true}
//           interval={3000}
//         />
//       </CarouselContainer> */}
//     </OwnersSection>
//   );
// };

// const OwnerCard = ({ owner }) => (
//   <Card>
//     <h3>{owner.name}</h3>
//     <p>Contact: {owner.contact}</p>
//     <p>Email: {owner.email}</p>
//     <RentingBadge>Verified Owner</RentingBadge>
//   </Card>
// );

// // Terms & Conditions Component
// const TermsAndConditions = () => {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true });

//   return (
//     <TermsSection ref={ref}>
//       <motion.h2
//         initial={{ opacity: 0, y: 20 }}
//         animate={isInView ? { opacity: 1, y: 0 } : {}}
//         transition={{ duration: 0.5 }}
//       >
//         Terms & Conditions
//       </motion.h2>
      
//       <TermsContent>
//         <ol>
//           <li>All rentals require verified user profiles</li>
//           <li>Products must be returned in original condition</li>
//           <li>Security deposit held until product return verification</li>
//           <li>Late returns incur 20% daily penalty</li>
//           <li>Disputes resolved through platform mediation</li>
//         </ol>
//       </TermsContent>
//     </TermsSection>
//   );
// };

// // Creators Component
// const Creators = () => {
//   const creators = [
//     { name: 'Tech Team', role: 'Development', contact: 'dev@justrentit.com' },
//     { name: 'Support Team', role: 'Customer Service', contact: 'support@justrentit.com' },
//     { name: 'Legal Team', role: 'Compliance', contact: 'legal@justrentit.com' },
//   ];

//   return (
//     <CreatorsSection>
//       <h2>Our Team</h2>
//       <CreatorGrid>
//         {creators.map((creator, index) => (
//           <CreatorCard key={index}>
//             <h3>{creator.name}</h3>
//             <p>{creator.role}</p>
//             <p>{creator.contact}</p>
//           </CreatorCard>
//         ))}
//       </CreatorGrid>
//     </CreatorsSection>
//   );
// };

// // Main Page Component
// const HomePage = () => (
//   <MainContainer>
//     <HeroSection>
//       <h1>Just Rent It</h1>
//       <p>Your seamless rental marketplace</p>
//     </HeroSection>

//     <OwnersContainer />
//     <Creators />
//     <TermsAndConditions />
//   </MainContainer>
// );

// // Styled Components
// const MainContainer = styled.div`
//   max-width: 1440px;
//   margin: 0 auto;
//   padding: 2rem;
// `;

// const HeroSection = styled.section`
//   text-align: center;
//   padding: 4rem 0;
//   background: linear-gradient(135deg, #6366f1, #3b82f6);
//   color: white;
//   border-radius: 1rem;
//   margin-bottom: 3rem;
// `;

// const OwnersSection = styled.section`
//   margin: 4rem 0;
//   padding: 2rem;
//   background: #f8fafc;
//   border-radius: 1rem;
// `;

// const CarouselContainer = styled.div`
//   margin: 2rem auto;
//   max-width: 1200px;
// `;

// const Card = styled.div`
//   background: white;
//   padding: 2rem;
//   border-radius: 1rem;
//   box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//   transition: transform 0.3s ease;

//   &:hover {
//     transform: translateY(-5px);
//   }
// `;

// const RentingBadge = styled.span`
//   background: #10b981;
//   color: white;
//   padding: 0.25rem 0.5rem;
//   border-radius: 0.25rem;
//   font-size: 0.875rem;
//   margin-top: 1rem;
//   display: inline-block;
// `;

// const TermsSection = styled.section`
//   margin: 4rem 0;
//   padding: 2rem;
//   background: #fff7ed;
//   border-radius: 1rem;
// `;

// const TermsContent = styled.div`
//   max-width: 800px;
//   margin: 0 auto;
//   line-height: 1.6;
// `;

// const CreatorsSection = styled.section`
//   margin: 4rem 0;
//   padding: 2rem;
//   background: #f0fdf4;
//   border-radius: 1rem;
// `;

// const CreatorGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//   gap: 2rem;
//   margin-top: 2rem;
// `;

// const CreatorCard = styled.div`
//   background: white;
//   padding: 1.5rem;
//   border-radius: 1rem;
//   text-align: center;
//   box-shadow: 0 2px 4px rgba(0,0,0,0.05);
// `;

// export default HomePage;