import api from '../utilities/api';

const cache = {
  events: new Map(),
  eventDetails: new Map(),
  galleries: new Map(),
  
  // Cache expiration time (5 minutes) - Not sure about it
  expirationTime: 5 * 60 * 1000,
  
  get: (key, collectionName) => {
    const collection = cache[collectionName];
    if (!collection) return null;
    
    const cachedItem = collection.get(key);
    if (!cachedItem) return null;
    
    if (Date.now() - cachedItem.timestamp > cache.expirationTime) {
      collection.delete(key);
      return null;
    }
    
    return cachedItem.data;
  },
  
  set: (key, data, collectionName) => {
    const collection = cache[collectionName];
    if (!collection) return;
    
    collection.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  clear: (collectionName) => {
    const collection = cache[collectionName];
    if (collection) {
      collection.clear();
    }
  },
  
  clearAll: () => {
    cache.events.clear();
    cache.eventDetails.clear();
    cache.galleries.clear();
  }
};

const eventService = {
  getNGOEvents: async (ngoId) => {
    const cachedEvents = cache.get(ngoId, 'events');
    if (cachedEvents) {
      return { success: true, data: cachedEvents };
    }
    
    try {
      const response = await api.get(`/api/events/organizers/${ngoId}`);
      
      if (response.data) {
        cache.set(ngoId, response.data, 'events');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch events';
      return { success: false, error: errorMessage };
    }
  },

  filterEvents: async (ngoId, filters = {}) => {
    try {
      const eventsResponse = await eventService.getNGOEvents(ngoId);
      
      if (!eventsResponse.success) {
        return eventsResponse;
      }
      
      let filteredEvents = [...eventsResponse.data];
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredEvents = filteredEvents.filter(event =>
          event.eventName.toLowerCase().startsWith(searchLower)
        );
      }
      
      if (filters.startDate) {
        const filterDate = new Date(filters.startDate);
        filteredEvents = filteredEvents.filter(event => {
          const eventStartDate = new Date(event.startDate);
          return eventStartDate >= filterDate;
        });
      }
      
      return { success: true, data: filteredEvents };
    } catch (error) {
      const errorMessage = error.message || 'Failed to filter events';
      return { success: false, error: errorMessage };
    }
  },

  getEventById: async (eventId) => {
    const cachedEvent = cache.get(eventId, 'eventDetails');
    if (cachedEvent) {
      return { success: true, data: cachedEvent };
    }
    
    try {
      const response = await api.get(`/api/events/${eventId}/`);
      
      if (response.data) {
        cache.set(eventId, response.data, 'eventDetails');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch event details';
      return { success: false, error: errorMessage };
    }
  },

  createEvent: async (eventData) => {
    try {
      if (eventData.focus_teams && !Array.isArray(eventData.focus_teams)) {
        eventData.focus_teams = [].concat(eventData.focus_teams || []);
      }
      
      if (eventData.competences && !Array.isArray(eventData.competences)) {
        eventData.competences = [].concat(eventData.competences || []);
      }
      
      const response = await api.post('/api/events/create/', eventData);
      
      const ngoId = eventData.organized_by;
      if (ngoId) {
        cache.clear('events');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create event';
      return { success: false, error: errorMessage };
    }
  },
  
  updateEvent: async (eventId, eventData) => {
    try {
      if (eventData.focus_teams && !Array.isArray(eventData.focus_teams)) {
        eventData.focus_teams = [].concat(eventData.focus_teams || []);
      }
      
      if (eventData.competences && !Array.isArray(eventData.competences)) {
        eventData.competences = [].concat(eventData.competences || []);
      }
      
      console.log('Sending data to update event:', eventData);
      const response = await api.put(`/api/events/${eventId}/update/`, eventData);
      
      // Clear all related caches to ensure we get fresh data
      cache.clearAll();
      console.log('Cache cleared after event update');
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating event:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error || 'Failed to update event';
      return { success: false, error: errorMessage };
    }
  },

  deleteEvent: async (eventId) => {
    try {
      await api.delete(`/api/events/${eventId}/delete/`);
      
      cache.clear('events');
      cache.get(eventId, 'eventDetails') && cache.set(eventId, null, 'eventDetails');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete event';
      return { success: false, error: errorMessage };
    }
  },

  getEventGallery: async (eventId) => {
    const cachedGallery = cache.get(eventId, 'galleries');
    if (cachedGallery) {
      return { success: true, data: cachedGallery };
    }
    
    try {
      const response = await api.get(`/api/events/${eventId}/gallery/`);
      
      if (response.data) {
        cache.set(eventId, response.data, 'galleries');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch event gallery';
      return { success: false, error: errorMessage };
    }
  }
};

export default eventService; 