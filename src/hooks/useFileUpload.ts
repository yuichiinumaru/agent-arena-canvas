
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadFile = async (file: File, path: string) => {
    if (!user) return null;
    
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${path}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('agent-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      return {
        path: filePath,
        size: file.size,
        type: file.type,
        name: file.name
      };
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
