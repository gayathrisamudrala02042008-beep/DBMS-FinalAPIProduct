import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';

export const UserDashboard = ({ onViewDetails }) => {
  const { user } = useAuth();
  const { searchLogs, getCatalog } = useDatabase();

  // Filter logs for the active user session
  const activeUsername = user ? user.username : 'guest_user';
  const myLogs = searchLogs.filter(log => log.username === activeUsername);

  // Smart User recommendations: calculate interest based on search logs
  const catalog = getCatalog();
  let recommended = [];
  
  if (myLogs.length > 0) {
    // Collect all intents logged by the user
    const loggedIntents = myLogs.flatMap(log => log.intent || []);
    
    // Score each catalog product based on how many logged intents it matches
    const scoredProducts = catalog.map(product => {
      let score = 0;
      if (loggedIntents.includes('CAT_LAPTOPS') && product.categoryId === 'cat-laptops') score += 3;
      if (loggedIntents.includes('CAT_SMARTPHONES') && product.categoryId === 'cat-smartphones') score += 3;
      if (loggedIntents.includes('CAT_STORAGE') && product.categoryId === 'cat-storage') score += 3;
      
      if (loggedIntents.includes('TAG_GAMING') && product.tags.includes('gaming')) score += 2;
      if (loggedIntents.includes('TAG_PHOTOGRAPHY') && product.tags.includes('photography')) score += 2;
      if (loggedIntents.includes('TAG_PORTABLE') && product.tags.includes('lightweight')) score += 2;
      if (loggedIntents.includes('TAG_AUDIO') && product.tags.includes('audio')) score += 2;
      
      if (loggedIntents.includes('PRICE_BUDGET') && product.price < 500) score += 1.5;
      if (loggedIntents.includes('PRICE_PREMIUM') && product.price > 1000) score += 1.5;

      return { product, score };
    });

    // Filter scored items and sort
    recommended = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 4);
  }

  // Fallback if no logs exist: show top rated
  if (recommended.length === 0) {
    recommended = catalog
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Welcome Hero glass panel */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'var(--accent-glow-gradient)',
        borderColor: 'rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract glowing sphere */}
        <div style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          filter: 'blur(20px)',
          bottom: '-50px',
          right: '-50px'
        }} />

        <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: '800', marginBottom: '8px' }}>
          Welcome back, {user ? user.username : 'Explorer'}!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', maxWidth: '600px' }}>
          This is your personal discovery cockpit. We track your natural language semantic queries in a MongoDB collection (`user_search_logs`) and calculate your tech preferences to recommend contextually relevant hardware.
        </p>
      </div>

      {/* Main dashboard content layout splits */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>
        
        {/* Left Side: Personalized Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🧬 Smart Recommendations
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommended.map(prod => (
              <div
                key={prod.id}
                onClick={() => onViewDetails(prod.id)}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: 'rgba(22, 18, 38, 0.45)',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Category icon block */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: prod.imageColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem'
                  }}>
                    {prod.categoryId === 'cat-laptops' && '💻'}
                    {prod.categoryId === 'cat-smartphones' && '📱'}
                    {prod.categoryId === 'cat-accessories' && '🎧'}
                    {prod.categoryId === 'cat-storage' && '💾'}
                    {prod.categoryId === 'cat-cameras' && '📷'}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                      {prod.brand}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {prod.name}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    ${prod.price}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    ⭐ {prod.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Vector Query Search Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🍃 Vector Search Queries (NoSQL Logs)
          </h3>

          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            {myLogs.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📖</div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>No searches recorded yet</h4>
                <p style={{ fontSize: '0.78rem' }}>Type natural language inputs in the search bar above to populate database activity logs.</p>
              </div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Query / Text</th>
                      <th>Intents Detected</th>
                      <th>Top Match</th>
                      <th>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: '500' }}>
                          <span style={{ display: 'block', fontSize: '0.85rem' }}>“{log.queryText}”</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {log.intent.length === 0 ? (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>None</span>
                            ) : (
                              log.intent.map(intent => (
                                <span
                                  key={intent}
                                  className="badge badge-cyan"
                                  style={{ fontSize: '0.58rem', padding: '2px 5px' }}
                                >
                                  {intent}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: log.topSimilarity >= 0.7 ? '#34d399' : 'var(--text-primary)'
                          }}>
                            🧬 {(log.topSimilarity * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent-secondary)' }}>
                          ⚡ {log.latencyMs}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
