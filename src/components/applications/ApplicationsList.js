import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUserCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../../styles/Applications.css';
import { useTranslation } from 'react-i18next';

const ApplicationsList = ({
  applications,
  selectedApplications,
  onToggleSelection,
  onToggleSelectAll,
  onViewDetails,
  onUpdateStatus,
  loading
}) => {
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedApplications, setPaginatedApplications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    const total = Math.ceil(applications.length / ITEMS_PER_PAGE);
    setTotalPages(total || 1); 
    
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedApplications(applications.slice(startIndex, endIndex));
  }, [applications, currentPage]);

  const handlePageChange = (pageNumber) => {
    const validPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(validPage);
  };

  const areAllCurrentPageItemsSelected = () => {
    if (paginatedApplications.length === 0) return false;
    return paginatedApplications.every(app => selectedApplications.includes(app.id));
  };

  const toggleSelectAllCurrentPage = () => {
    const allSelected = areAllCurrentPageItemsSelected();
    
    if (allSelected) {
      const currentPageIds = paginatedApplications.map(app => app.id);
      const newSelection = selectedApplications.filter(id => !currentPageIds.includes(id));
      onToggleSelectAll(newSelection);
    } else {
      const currentPageIds = paginatedApplications.map(app => app.id);
      const newSelection = [...new Set([...selectedApplications, ...currentPageIds])];
      onToggleSelectAll(newSelection);
    }
  };

  const renderStatusBadge = (status, statusDisplay) => (
    <span className={`status-badge status-${status}`}>
      {statusDisplay}
    </span>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination-controls">
        <button 
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
        
        <div className="pagination-info">
          Page {currentPage} of {totalPages}
        </div>
        
        <button 
          className="pagination-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className="applications-table">
      <div className="table-header">
        <div className="select-all-container">
          <input 
            type="checkbox" 
            checked={areAllCurrentPageItemsSelected() && paginatedApplications.length > 0}
            onChange={toggleSelectAllCurrentPage}
          />
          <span className="select-all-label">{t('applications.applications')}</span>
        </div>
        <div className="results-count">
          {loading && (
            <div className="loading-spinner" style={{ display: 'inline-block', marginRight: '8px', height: 'auto' }}>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          )}
          {applications.length} {t('applications.results')}
        </div>
      </div>
      
      {applications.length === 0 ? (
        <div className="no-results">
          <p>{t('applications.noApplicationsFound')}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="applications-list">
            <thead>
              <tr>
                <th width="50"></th>
                <th>{t('applications.applicant')}</th>
                <th>{t('applications.event')}</th>
                <th>{t('applications.applicationDate')}</th>
                <th>{t('applications.status')}</th>
                <th>{t('applications.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApplications.map(application => (
                <tr key={application.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => onToggleSelection(application.id)}
                    />
                  </td>
                  <td>
                    <div className="applicant-info">
                      <FaUserCircle className="applicant-icon" size={24} />
                      <div>
                        <div className="applicant-name">{application.user.full_name}</div>
                        <div className="applicant-email">{application.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{application.event_name}</td>
                  <td>{new Date(application.application_date).toLocaleDateString()}</td>
                  <td>{renderStatusBadge(application.status, application.status_display)}</td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="action-btn action-btn-view"
                        onClick={() => onViewDetails(application)}
                      >
                        {t('applications.view')}
                      </button>
                      
                      {application.status !== 'accepted' && (
                        <button 
                          className="action-btn action-btn-accept"
                          onClick={() => onUpdateStatus(application.id, 'accepted')}
                        >
                          <FaCheckCircle />
                          {t('applications.accept')}
                        </button>
                      )}
                      
                      {application.status !== 'waitlisted' && (
                        <button 
                          className="action-btn action-btn-waitlist"
                          onClick={() => onUpdateStatus(application.id, 'waitlisted')}
                        >
                          <FaHourglassHalf />
                          {t('applications.waitlist')}
                        </button>
                      )}
                      
                      {(application.status === 'accepted' || application.status === 'waitlisted') && (
                        <button 
                          className="action-btn action-btn-revert"
                          onClick={() => onUpdateStatus(application.id, 'applied')}
                        >
                          <FaTimesCircle />
                          {t('applications.revert')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default ApplicationsList; 