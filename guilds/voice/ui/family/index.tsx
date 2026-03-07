import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@openconnect/ui';

interface ApprovedContact {
  id: string;
  incarceratedPersonId: string;
  familyMemberId: string;
  relationship: string;
  isAttorney: boolean;
  status: string;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  incarceratedPerson: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

function VoiceHome() {
  const [contacts, setContacts] = useState<ApprovedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovedContacts();
  }, []);

  const fetchApprovedContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/voice/contacts/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to fetch contacts');
      }

      setContacts(data.data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Voice Calls</h1>
      
      <Card>
        <CardHeader 
          title="Approved Contacts" 
          subtitle="People who are approved to call you"
        />
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading contacts...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && contacts.length === 0 && (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">👥</span>
              <p className="text-gray-600">
                You don't have any approved contacts yet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                When someone adds you as a contact and it gets approved, they'll appear here.
              </p>
            </div>
          )}

          {!loading && !error && contacts.length > 0 && (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {contact.incarceratedPerson.firstName[0]}
                        {contact.incarceratedPerson.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {contact.incarceratedPerson.firstName} {contact.incarceratedPerson.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {contact.relationship}
                        {contact.isAttorney && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Attorney
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ Approved
                    </div>
                    {contact.reviewedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Approved {new Date(contact.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card padding="lg">
        <div className="text-center py-4">
          <span className="text-4xl mb-4 block">📞</span>
          <h2 className="text-xl font-semibold mb-2">Incoming Calls</h2>
          <p className="text-gray-600 mb-4">
            You will receive calls from your approved contacts on your regular phone.
          </p>
          <p className="text-sm text-gray-500">
            Features coming soon:
          </p>
          <ul className="text-sm text-gray-500 mt-2 space-y-1">
            <li>Accept/decline call prompts</li>
            <li>Call history</li>
            <li>Block calls</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default function VoiceFamily() {
  return (
    <Routes>
      <Route index element={<VoiceHome />} />
    </Routes>
  );
}
