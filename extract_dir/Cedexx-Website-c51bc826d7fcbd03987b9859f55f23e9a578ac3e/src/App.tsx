import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { Blog } from './pages/Blog';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Corporate } from './pages/Corporate';
import { Enroll } from './pages/Enroll';
import { Partners } from './pages/Partners';
import { Contact } from './pages/Contact';
import { ScheduleDemo } from './pages/ScheduleDemo';
import VideoLibrary from './pages/VideoLibrary';
import { InvestorPitch } from './pages/InvestorPitch';
import { LanguageProvider } from './context/LanguageContext';
import { Splash } from './components/Splash';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <LanguageProvider>
      {showSplash && <Splash onFinish={() => setShowSplash(false)} />}
      <div className={showSplash ? 'hidden' : 'block'}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="video_library" element={<VideoLibrary />} />
              <Route path="blog" element={<Blog />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="corporate" element={<Corporate />} />
              <Route path="enroll" element={<Enroll />} />
              <Route path="partners" element={<Partners />} />
              <Route path="investor-pitch" element={<InvestorPitch />} />
              <Route path="contact" element={<Contact />} />
              <Route path="schedule-demo" element={<ScheduleDemo />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}
