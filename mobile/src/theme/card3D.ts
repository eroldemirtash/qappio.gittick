// 3D Card Styles for Qappio Mobile App
export const card3DStyles = {
  // Base 3D card container
  card3D: {
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 8 
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // Enhanced 3D card for important elements
  card3DEnhanced: {
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 12 
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // 3D card with gradient shadow
  card3DGradient: {
    shadowColor: '#00bcd4',
    shadowOffset: { 
      width: 0, 
      height: 10 
    },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 14,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // 3D card for marketplace items
  card3DMarketplace: {
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 6 
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // 3D card for brand cards
  card3DBrand: {
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 10 
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 14,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // 3D card for purchase sections
  card3DPurchase: {
    shadowColor: '#10b981',
    shadowOffset: { 
      width: 0, 
      height: 8 
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // 3D card for modal content
  card3DModal: {
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 20 
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 24,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // 3D card for mission cards
  card3DMission: {
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 8 
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  // 3D card for profile cards
  card3DProfile: {
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 6 
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  }
};

// Helper function to apply 3D styles
export const apply3DCardStyle = (baseStyle: any, cardType: keyof typeof card3DStyles = 'card3D') => {
  return {
    ...baseStyle,
    ...card3DStyles[cardType]
  };
};
